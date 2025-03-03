import { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { runEnableWhen } from '../enableWhenFunctional';
import { q } from './__data__/enableWhenFunctional/index';

import { generateQuestionnaireResponse } from '@/actions/generateQuestionnaireResponse';
import { QuestionnaireItemEnableBehaviorCodes } from '@/types/fhirEnums';

// Add this updated function with debugging
function updateAnswerByLinkId(
  response: QuestionnaireResponse,
  linkId: string,
  answer: QuestionnaireResponseItemAnswer[]
): QuestionnaireResponse {
  // Create deep copy for immutability
  const newResponse = JSON.parse(JSON.stringify(response));
  console.log(`userlog TEST DEBUG: Updating linkId "${linkId}" with answer:`, JSON.stringify(answer));

  // Track which item we update to verify correct targeting
  let updatedItems = 0;
  const updatedPaths: string[] = [];

  // Helper function to find and update the item recursively
  function updateItemRecursively(items: QuestionnaireResponseItem[], path: string = ''): boolean {
    for (let i = 0; i < items.length; i++) {
      const currentPath = path ? `${path} > ${items[i].linkId}[${i}]` : `${items[i].linkId}[${i}]`;

      if (items[i].linkId === linkId) {
        console.log(`userlog TEST DEBUG: Found matching item at path: ${currentPath}`);
        items[i].answer = answer;
        updatedItems++;
        updatedPaths.push(currentPath);

        // IMPORTANT: Don't return here if you want to update all instances!
        // return true;
      }

      // Check in item.item
      if (items[i].item) {
        updateItemRecursively(items[i].item!, currentPath);
      }

      // Check in answer.item
      if (items[i].answer) {
        for (let j = 0; j < items[i].answer!.length; j++) {
          if (items[i].answer![j].item) {
            updateItemRecursively(items[i].answer![j].item!, `${currentPath} > answer[${j}]`);
          }
        }
      }
    }
    return updatedItems > 0;
  }

  if (newResponse.item) {
    updateItemRecursively(newResponse.item);
  }

  console.log(`userlog TEST DEBUG: Updated ${updatedItems} items with linkId "${linkId}" at paths: ${updatedPaths.join(', ')}`);
  return newResponse;
}

function updateMultipleAnswers(
  response: QuestionnaireResponse,
  updates: { linkId: string; answer: QuestionnaireResponseItemAnswer[] }[]
): QuestionnaireResponse {
  let newResponse = JSON.parse(JSON.stringify(response));

  for (const update of updates) {
    newResponse = updateAnswerByLinkId(newResponse, update.linkId, update.answer);
  }

  return newResponse;
}

describe('enableWhenFunctional', () => {
  describe('runEnableWhen', () => {
    it('should return the original response if questionnaire is undefined', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [{ linkId: 'test' }],
      };

      const result = runEnableWhen(undefined, response);
      expect(result).toBe(response); // Should return the same object reference
    });

    it('should return the original response if no items have enableWhen conditions', () => {
      const simpleQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          { linkId: 'simple1', type: 'string' },
          { linkId: 'simple2', type: 'boolean' },
        ],
      };

      const response = generateQuestionnaireResponse(simpleQuestionnaire);
      const result = runEnableWhen(simpleQuestionnaire, response);

      // Should be the same reference since nothing needs to change
      expect(result).toBe(response);
    });

    it('should clear answers for disabled items', () => {
      // Create a questionnaire with enableWhen conditions
      const testQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'condition',
            type: 'boolean',
          },
          {
            linkId: 'dependent',
            type: 'string',
            enableWhen: [
              {
                question: 'condition',
                operator: '=',
                answerBoolean: true,
              },
            ],
          },
        ],
      };

      // Generate initial response
      const initialResponse = generateQuestionnaireResponse(testQuestionnaire);

      // Update with test values - condition is false, so dependent should be disabled
      const testResponse = updateMultipleAnswers(initialResponse!, [
        { linkId: 'condition', answer: [{ valueBoolean: false }] },
        { linkId: 'dependent', answer: [{ valueString: 'should be cleared' }] },
      ]);

      const result = runEnableWhen(testQuestionnaire, testResponse);

      // Response should be a new object (immutable)
      expect(result).not.toBe(testResponse);

      // The dependent item should have its answer cleared
      const dependentItem = result?.item?.find(i => i.linkId === 'dependent');
      expect(dependentItem?.answer).toEqual([]);

      // The condition item should keep its answer
      const conditionItem = result?.item?.find(i => i.linkId === 'condition');
      expect(conditionItem?.answer?.[0].valueBoolean).toBe(false);
    });

    it('should handle nested items being disabled', () => {
      const testQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'condition',
            type: 'boolean',
          },
          {
            linkId: 'parent',
            type: 'group',
            enableWhen: [
              {
                question: 'condition',
                operator: '=',
                answerBoolean: true,
              },
            ],
            item: [
              { linkId: 'child1', type: 'string' },
              { linkId: 'child2', type: 'string' },
            ],
          },
        ],
      };

      // Generate initial response
      const initialResponse = generateQuestionnaireResponse(testQuestionnaire)!;

      // Update with test values - condition is false, so parent and its children should be disabled
      const testResponse = updateMultipleAnswers(initialResponse, [
        { linkId: 'condition', answer: [{ valueBoolean: false }] },
        { linkId: 'child1', answer: [{ valueString: 'should be cleared' }] },
        { linkId: 'child2', answer: [{ valueString: 'should also be cleared' }] },
      ]);

      const result = runEnableWhen(testQuestionnaire, testResponse);

      // The parent item's children should have answers cleared
      const parentItem = result?.item?.find(i => i.linkId === 'parent');
      const child1 = parentItem?.item?.find(i => i.linkId === 'child1');
      const child2 = parentItem?.item?.find(i => i.linkId === 'child2');

      expect(child1?.answer).toEqual([]);
      expect(child2?.answer).toEqual([]);
    });

    it('should handle cross-references between sections', () => {
      // Create a direct test questionnaire with cross-section references
      const testQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'section1',
            type: 'group',
            item: [
              {
                linkId: 'condition',
                type: 'boolean',
              },
            ],
          },
          {
            linkId: 'section2',
            type: 'group',
            item: [
              {
                linkId: 'dependent',
                type: 'string',
                enableWhen: [
                  {
                    question: 'condition',
                    operator: '=',
                    answerBoolean: true,
                  },
                ],
              },
            ],
          },
        ],
      };

      // Create response directly with our test data
      const testResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'section1',
            item: [
              {
                linkId: 'condition',
                answer: [{ valueBoolean: false }], // Condition is false
              },
            ],
          },
          {
            linkId: 'section2',
            item: [
              {
                linkId: 'dependent',
                answer: [{ valueString: 'Should be cleared - cross reference' }],
              },
            ],
          },
        ],
      };

      // Run enableWhen
      const result = runEnableWhen(testQuestionnaire, testResponse);

      // Navigate to dependent item in section2
      const section2 = result?.item?.[1];
      const dependent = section2?.item?.[0];

      // Item dependent references condition in section1, so should be cleared
      expect(dependent?.answer).toEqual([]);
    });

    it('should handle nested repeating groups with enableWhen conditions', () => {
      // Create a questionnaire with nested repeating groups and enableWhen
      const testQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'outer',
            type: 'group',
            repeats: true,
            item: [
              {
                linkId: 'condition',
                type: 'boolean',
              },
              {
                linkId: 'dependent',
                type: 'string',
                enableWhen: [
                  {
                    question: 'condition',
                    operator: '=',
                    answerBoolean: true,
                  },
                ],
              },
            ],
          },
        ],
      };

      // Create response directly with two instances of outer group
      const testResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'outer', // First instance
            item: [
              {
                linkId: 'condition',
                answer: [{ valueBoolean: true }], // Enabled
              },
              {
                linkId: 'dependent',
                answer: [{ valueString: 'This should remain' }],
              },
            ],
          },
          {
            linkId: 'outer', // Second instance
            item: [
              {
                linkId: 'condition',
                answer: [{ valueBoolean: false }], // Disabled
              },
              {
                linkId: 'dependent',
                answer: [{ valueString: 'This should be cleared' }],
              },
            ],
          },
        ],
      };

      // Run enableWhen
      const result = runEnableWhen(testQuestionnaire, testResponse);

      // Navigate to the items to verify
      const outerInstances = result?.item;

      if (outerInstances && outerInstances.length >= 2) {
        // First instance - condition is true, dependent should keep its value
        const firstDependent = outerInstances[0].item?.find(i => i.linkId === 'dependent');
        expect(firstDependent?.answer?.[0].valueString).toBe('This should remain');

        // Second instance - condition is false, dependent should be cleared
        const secondDependent = outerInstances[1].item?.find(i => i.linkId === 'dependent');
        expect(secondDependent?.answer).toEqual([]);
      }
    });

    it('should handle complex nested cases with mixed enableWhen behaviors', () => {
      // Create a specific test questionnaire with predictable linkIds
      const testQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'section3',
            text: 'Section 3 - Mixed EnableWhen Behaviors',
            type: 'group',
            item: [
              {
                linkId: 'condition1',
                text: 'Condition 1',
                type: 'boolean',
              },
              {
                linkId: 'condition2',
                text: 'Condition 2',
                type: 'boolean',
              },
              {
                linkId: 'anyBehavior',
                text: 'Item with ANY behavior',
                type: 'string',
                enableWhen: [
                  {
                    question: 'condition1',
                    operator: '=',
                    answerBoolean: true,
                  },
                  {
                    question: 'condition2',
                    operator: '=',
                    answerBoolean: true,
                  },
                ],
                enableBehavior: QuestionnaireItemEnableBehaviorCodes.ANY,
              },
              {
                linkId: 'allBehavior',
                text: 'Item with ALL behavior',
                type: 'string',
                enableWhen: [
                  {
                    question: 'condition1',
                    operator: '=',
                    answerBoolean: true,
                  },
                  {
                    question: 'condition2',
                    operator: '=',
                    answerBoolean: true,
                  },
                ],
                enableBehavior: QuestionnaireItemEnableBehaviorCodes.ALL,
              },
            ],
          },
        ],
      };

      // Create a response with our test data
      const testResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'section3',
            item: [
              {
                linkId: 'condition1',
                answer: [{ valueBoolean: false }],
              },
              {
                linkId: 'condition2',
                answer: [{ valueBoolean: true }],
              },
              {
                linkId: 'anyBehavior',
                answer: [{ valueString: 'Should stay - ANY behavior' }],
              },
              {
                linkId: 'allBehavior',
                answer: [{ valueString: 'Should be cleared - ALL behavior' }],
              },
            ],
          },
        ],
      };

      // Run enableWhen
      const result = runEnableWhen(testQuestionnaire, testResponse);

      // Find the section
      const section3Result = result?.item?.[0];

      // Check anyBehavior item - should be enabled and keep its value
      const anyBehaviorItem = section3Result?.item?.find(i => i.linkId === 'anyBehavior');
      expect(anyBehaviorItem?.answer?.[0].valueString).toBe('Should stay - ANY behavior');

      // Check allBehavior item - should be disabled and have answer cleared
      const allBehaviorItem = section3Result?.item?.find(i => i.linkId === 'allBehavior');
      expect(allBehaviorItem?.answer).toEqual([]);
    });

    it('should handle deep nesting with complex conditions', () => {
      // Generate initial response from questionnaire
      const initialResponse = generateQuestionnaireResponse(q)!;

      // Set up section 4 with nested conditions
      const testResponse = updateMultipleAnswers(initialResponse, [
        // Set 4.1 to Option C which enables 4.3
        { linkId: '4.1', answer: [{ valueString: 'Option C' }] },

        // Set 4.3.2 to false which should disable 4.3.3
        { linkId: '4.3.2', answer: [{ valueBoolean: false }] },

        // Add content to 4.3.3 which should be cleared
        { linkId: '4.3.3', answer: [{ valueString: 'Should be cleared - nested condition' }] },
      ]);

      const result = runEnableWhen(q, testResponse);

      // Navigate to section 4.3.3
      const section4 = result?.item?.find(i => i.linkId === '4');
      const section4_3 = section4?.item?.find(i => i.linkId === '4.3');
      const item4_3_3 = section4_3?.item?.find(i => i.linkId === '4.3.3');

      // Item 4.3.3 should have its answer cleared because 4.3.2 is false
      expect(item4_3_3?.answer).toEqual(undefined);
    });
    it('should handle string comparisons in enableWhen conditions', () => {
      // Test questionnaire with string comparison
      const testQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'textChoice',
            type: 'choice',
            answerOption: [{ valueString: 'Option A' }, { valueString: 'Option B' }, { valueString: 'Option C' }],
          },
          {
            linkId: 'conditional',
            type: 'string',
            enableWhen: [
              {
                question: 'textChoice',
                operator: '=',
                answerString: 'Option B',
              },
            ],
          },
        ],
      };

      // Generate initial response
      const initialResponse = generateQuestionnaireResponse(testQuestionnaire);

      // Update with Option A - should disable the conditional
      const testResponseA = updateMultipleAnswers(initialResponse!, [
        { linkId: 'textChoice', answer: [{ valueString: 'Option A' }] },
        { linkId: 'conditional', answer: [{ valueString: 'should be cleared' }] },
      ]);

      const resultA = runEnableWhen(testQuestionnaire, testResponseA);
      const conditionalItemA = resultA?.item?.find(i => i.linkId === 'conditional');
      expect(conditionalItemA?.answer).toEqual([]);

      // Update with Option B - should enable the conditional
      const testResponseB = updateMultipleAnswers(initialResponse!, [
        { linkId: 'textChoice', answer: [{ valueString: 'Option B' }] },
        { linkId: 'conditional', answer: [{ valueString: 'should remain' }] },
      ]);

      const resultB = runEnableWhen(testQuestionnaire, testResponseB);
      const conditionalItemB = resultB?.item?.find(i => i.linkId === 'conditional');
      expect(conditionalItemB?.answer?.[0].valueString).toBe('should remain');
    });

    it('should handle complex nested cases with mixed enableWhen behaviors', () => {
      // Create a specific test questionnaire with predictable linkIds
      const testQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'section3',
            text: 'Section 3 - Mixed EnableWhen Behaviors',
            type: 'group',
            item: [
              {
                linkId: 'condition1',
                text: 'Condition 1',
                type: 'boolean',
              },
              {
                linkId: 'condition2',
                text: 'Condition 2',
                type: 'boolean',
              },
              {
                linkId: 'anyBehavior',
                text: 'Item with ANY behavior',
                type: 'string',
                enableWhen: [
                  {
                    question: 'condition1',
                    operator: '=',
                    answerBoolean: true,
                  },
                  {
                    question: 'condition2',
                    operator: '=',
                    answerBoolean: true,
                  },
                ],
                enableBehavior: QuestionnaireItemEnableBehaviorCodes.ANY,
              },
              {
                linkId: 'allBehavior',
                text: 'Item with ALL behavior',
                type: 'string',
                enableWhen: [
                  {
                    question: 'condition1',
                    operator: '=',
                    answerBoolean: true,
                  },
                  {
                    question: 'condition2',
                    operator: '=',
                    answerBoolean: true,
                  },
                ],
                // ALL is default, but we'll set it explicitly for clarity
                enableBehavior: QuestionnaireItemEnableBehaviorCodes.ALL,
              },
            ],
          },
        ],
      };

      // Create a response directly with our test data (no helper methods)
      const testResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'section3',
            item: [
              {
                linkId: 'condition1',
                answer: [{ valueBoolean: false }], // First condition is FALSE
              },
              {
                linkId: 'condition2',
                answer: [{ valueBoolean: true }], // Second condition is TRUE
              },
              {
                linkId: 'anyBehavior',
                answer: [{ valueString: 'Should stay - ANY behavior' }],
              },
              {
                linkId: 'allBehavior',
                answer: [{ valueString: 'Should be cleared - ALL behavior' }],
              },
            ],
          },
        ],
      };

      // Run enableWhen
      const result = runEnableWhen(testQuestionnaire, testResponse);

      // Find the section
      const section3Result = result?.item?.[0];

      // Check anyBehavior item - should be enabled and keep its value
      // (because one of its conditions is true - condition2)
      const anyBehaviorItem = section3Result?.item?.find(i => i.linkId === 'anyBehavior');
      expect(anyBehaviorItem?.answer?.[0].valueString).toBe('Should stay - ANY behavior');

      // Check allBehavior item - should be disabled and have answer cleared
      // (because not all conditions are true - condition1 is false)
      const allBehaviorItem = section3Result?.item?.find(i => i.linkId === 'allBehavior');
      expect(allBehaviorItem?.answer).toEqual([]);
    });
    it('should handle deep nesting with complex conditions', () => {
      // This test uses the comprehensive questionnaire 'q'
      // Generate initial response from questionnaire
      const initialResponse = generateQuestionnaireResponse(q);

      // Set up section 4 with nested conditions
      const testResponse = updateMultipleAnswers(initialResponse!, [
        // Set 4.1 to Option C which enables 4.3
        { linkId: '4.1', answer: [{ valueString: 'Option C' }] },

        // Set 4.3.2 to false which should disable 4.3.3
        { linkId: '4.3.2', answer: [{ valueBoolean: false }] },

        // Add content to 4.3.3 which should be cleared
        { linkId: '4.3.3', answer: [{ valueString: 'Should be cleared - nested condition' }] },
      ]);

      const result = runEnableWhen(q, testResponse);

      // Navigate to section 4.3.3
      const section4 = result?.item?.find(i => i.linkId === '4');
      const section4_3 = section4?.item?.find(i => i.linkId === '4.3');
      const item4_3_3 = section4_3?.item?.find(i => i.linkId === '4.3.3');

      // Item 4.3.3 should have its answer cleared because 4.3.2 is false
      expect(item4_3_3?.answer).toEqual(undefined);

      // Also check that 4.3.1 keeps its answers (it doesn't have conditions)
      const item4_3_1 = section4_3?.item?.find(i => i.linkId === '4.3.1');
      expect(item4_3_1?.answer).not.toEqual([]);
    });

    it('should handle nested repeating groups with enableWhen conditions', () => {
      // Create a simplified questionnaire with nested repeating structure
      const testQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'outer',
            type: 'group',
            repeats: true,
            item: [
              {
                linkId: 'condition',
                type: 'boolean',
              },
              {
                linkId: 'dependent',
                type: 'string',
                enableWhen: [
                  {
                    question: 'condition',
                    operator: '=',
                    answerBoolean: true,
                  },
                ],
              },
            ],
          },
        ],
      };

      // Create a response with two outer instances, different condition values
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'outer', // First instance
            item: [
              {
                linkId: 'condition',
                answer: [{ valueBoolean: true }], // Enabled
              },
              {
                linkId: 'dependent',
                answer: [{ valueString: 'This should remain' }],
              },
            ],
          },
          {
            linkId: 'outer', // Second instance
            item: [
              {
                linkId: 'condition',
                answer: [{ valueBoolean: false }], // Disabled
              },
              {
                linkId: 'dependent',
                answer: [{ valueString: 'This should be cleared' }],
              },
            ],
          },
        ],
      };

      // Run enableWhen
      const result = runEnableWhen(testQuestionnaire, response);

      // Navigate to the items to verify
      const outerInstances = result?.item;

      if (outerInstances && outerInstances.length >= 2) {
        // First instance - condition is true, dependent should keep its value
        const firstDependent = outerInstances[0].item?.find(i => i.linkId === 'dependent');
        expect(firstDependent?.answer?.[0].valueString).toBe('This should remain');

        // Second instance - condition is false, dependent should be cleared
        const secondDependent = outerInstances[1].item?.find(i => i.linkId === 'dependent');
        expect(secondDependent?.answer).toEqual([]);
      }
    });

    it('should not change answers for items with no conditions', () => {
      // Create a mixed questionnaire with both conditional and unconditional items
      const testQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'condition',
            type: 'boolean',
          },
          {
            linkId: 'dependent',
            type: 'string',
            enableWhen: [
              {
                question: 'condition',
                operator: '=',
                answerBoolean: true,
              },
            ],
          },
          {
            linkId: 'unconditional',
            type: 'string',
          },
        ],
      };

      // Generate initial response
      const initialResponse = generateQuestionnaireResponse(testQuestionnaire);

      // Update with test values
      const testResponse = updateMultipleAnswers(initialResponse!, [
        { linkId: 'condition', answer: [{ valueBoolean: false }] },
        { linkId: 'dependent', answer: [{ valueString: 'should be cleared' }] },
        { linkId: 'unconditional', answer: [{ valueString: 'should remain' }] },
      ]);

      const result = runEnableWhen(testQuestionnaire, testResponse);

      // The dependent item should have its answer cleared
      const dependentItem = result?.item?.find(i => i.linkId === 'dependent');
      expect(dependentItem?.answer).toEqual([]);

      // The unconditional item should keep its answer
      const unconditionalItem = result?.item?.find(i => i.linkId === 'unconditional');
      expect(unconditionalItem?.answer?.[0].valueString).toBe('should remain');
    });
  });
  describe('enableWhenFunctional - complex rules', () => {
    describe('Rule 1: enableWhen in repeated groups', () => {
      it('should only apply enableWhen within a repeated group context', () => {
        // Create a questionnaire with repeating groups and enableWhen conditions
        const testQuestionnaire: Questionnaire = {
          resourceType: 'Questionnaire',
          status: 'active',
          item: [
            {
              linkId: 'repeatingGroup',
              type: 'group',
              repeats: true,
              item: [
                {
                  linkId: 'condition',
                  type: 'boolean',
                },
                {
                  linkId: 'dependent',
                  type: 'string',
                  enableWhen: [
                    {
                      question: 'condition',
                      operator: '=',
                      answerBoolean: true,
                    },
                  ],
                },
              ],
            },
          ],
        };

        // Directly create a response with two instances of the repeating group
        const response: QuestionnaireResponse = {
          resourceType: 'QuestionnaireResponse',
          status: 'in-progress',
          item: [
            // First instance with condition=true (dependent should remain)
            {
              linkId: 'repeatingGroup',
              item: [
                {
                  linkId: 'condition',
                  answer: [{ valueBoolean: true }],
                },
                {
                  linkId: 'dependent',
                  answer: [{ valueString: 'Should remain' }],
                },
              ],
            },
            // Second instance with condition=false (dependent should be cleared)
            {
              linkId: 'repeatingGroup',
              item: [
                {
                  linkId: 'condition',
                  answer: [{ valueBoolean: false }],
                },
                {
                  linkId: 'dependent',
                  answer: [{ valueString: 'Should be cleared' }],
                },
              ],
            },
          ],
        };

        // Run enableWhen
        const result = runEnableWhen(testQuestionnaire, response);

        // Check results
        const resultGroups = result?.item?.filter(item => item.linkId === 'repeatingGroup');

        if (resultGroups && resultGroups.length >= 2) {
          // First instance should keep its value
          const firstDependent = resultGroups[0].item?.find(i => i.linkId === 'dependent');
          expect(firstDependent?.answer?.[0]?.valueString).toBe('Should remain');

          // Second instance should have answer cleared
          const secondDependent = resultGroups[1].item?.find(i => i.linkId === 'dependent');
          expect(secondDependent?.answer).toEqual([]);
        }
      });
    });

    describe('Rule 2: Initial values for disabled items', () => {
      it('should set initial values when an item becomes disabled', () => {
        // Create a questionnaire with initialValue
        const testQuestionnaire: Questionnaire = {
          resourceType: 'Questionnaire',
          status: 'active',
          item: [
            {
              linkId: 'condition',
              type: 'boolean',
            },
            {
              linkId: 'dependentWithInitial',
              type: 'string',
              initial: [{ valueString: 'Default value' }],
              enableWhen: [
                {
                  question: 'condition',
                  operator: '=',
                  answerBoolean: true,
                },
              ],
            },
            {
              linkId: 'dependentWithoutInitial',
              type: 'string',
              enableWhen: [
                {
                  question: 'condition',
                  operator: '=',
                  answerBoolean: true,
                },
              ],
            },
          ],
        };

        // Generate response with both dependent items having values
        const response = updateMultipleAnswers(generateQuestionnaireResponse(testQuestionnaire)!, [
          { linkId: 'condition', answer: [{ valueBoolean: false }] }, // Disable both dependents
          { linkId: 'dependentWithInitial', answer: [{ valueString: 'Will be reset to default' }] },
          { linkId: 'dependentWithoutInitial', answer: [{ valueString: 'Will be completely cleared' }] },
        ]);

        // Run enableWhen
        const result = runEnableWhen(testQuestionnaire, response);

        // The item with initial value should be reset to that value
        const withInitial = result?.item?.find(i => i.linkId === 'dependentWithInitial');
        expect(withInitial?.answer?.[0].valueString).toBe('Default value');

        // The item without initial value should have its answer array emptied
        const withoutInitial = result?.item?.find(i => i.linkId === 'dependentWithoutInitial');
        expect(withoutInitial?.answer).toEqual([]);
      });
    });

    describe('Rule 3: Boolean default values', () => {
      it('should set boolean items to false when disabled without initial value', () => {
        // Create a questionnaire with boolean items
        const testQuestionnaire: Questionnaire = {
          resourceType: 'Questionnaire',
          status: 'active',
          item: [
            {
              linkId: 'mainCondition',
              type: 'boolean',
            },
            {
              linkId: 'booleanWithInitial',
              type: 'boolean',
              initial: [{ valueBoolean: true }],
              enableWhen: [
                {
                  question: 'mainCondition',
                  operator: '=',
                  answerBoolean: true,
                },
              ],
            },
            {
              linkId: 'booleanWithoutInitial',
              type: 'boolean',
              enableWhen: [
                {
                  question: 'mainCondition',
                  operator: '=',
                  answerBoolean: true,
                },
              ],
            },
          ],
        };

        // Generate response with both boolean items set to true
        const response = updateMultipleAnswers(generateQuestionnaireResponse(testQuestionnaire)!, [
          { linkId: 'mainCondition', answer: [{ valueBoolean: false }] }, // Disable both dependents
          { linkId: 'booleanWithInitial', answer: [{ valueBoolean: true }] },
          { linkId: 'booleanWithoutInitial', answer: [{ valueBoolean: true }] },
        ]);

        // Run enableWhen
        const result = runEnableWhen(testQuestionnaire, response);

        // The boolean with initial should get that value
        const withInitial = result?.item?.find(i => i.linkId === 'booleanWithInitial');
        expect(withInitial?.answer?.[0].valueBoolean).toBe(true);

        // The boolean without initial should get false
        const withoutInitial = result?.item?.find(i => i.linkId === 'booleanWithoutInitial');
        expect(withoutInitial?.answer?.[0].valueBoolean).toBe(false);
      });
    });

    describe('Rule 4: Recursive enableWhen evaluation', () => {
      it('should handle cascading enableWhen conditions', () => {
        // Create a questionnaire with cascading enableWhen
        const testQuestionnaire: Questionnaire = {
          resourceType: 'Questionnaire',
          status: 'active',
          item: [
            {
              linkId: 'first',
              type: 'boolean',
            },
            {
              linkId: 'second',
              type: 'boolean',
              enableWhen: [
                {
                  question: 'first',
                  operator: '=',
                  answerBoolean: true,
                },
              ],
            },
            {
              linkId: 'third',
              type: 'string',
              enableWhen: [
                {
                  question: 'second',
                  operator: '=',
                  answerBoolean: true,
                },
              ],
            },
          ],
        };

        // Generate response with all values set
        const response = updateMultipleAnswers(generateQuestionnaireResponse(testQuestionnaire)!, [
          { linkId: 'first', answer: [{ valueBoolean: false }] }, // This should disable second
          { linkId: 'second', answer: [{ valueBoolean: true }] }, // Which should disable third
          { linkId: 'third', answer: [{ valueString: 'Should be cleared' }] },
        ]);

        // Run enableWhen
        const result = runEnableWhen(testQuestionnaire, response);

        // Second item should be set to false (boolean default)
        const secondItem = result?.item?.find(i => i.linkId === 'second');
        expect(secondItem?.answer?.[0].valueBoolean).toBe(false);

        // Third item should have its answer cleared
        const thirdItem = result?.item?.find(i => i.linkId === 'third');
        expect(thirdItem?.answer).toEqual([]);
      });
    });

    describe('Rule 5: Removal of disabled repeated items', () => {
      it('should remove repeated items that get disabled', () => {
        // Create a questionnaire with a repeating item that can be disabled
        const testQuestionnaire: Questionnaire = {
          resourceType: 'Questionnaire',
          status: 'active',
          item: [
            {
              linkId: 'condition',
              type: 'boolean',
            },
            {
              linkId: 'repeatingItem',
              type: 'string',
              repeats: true,
              enableWhen: [
                {
                  question: 'condition',
                  operator: '=',
                  answerBoolean: true,
                },
              ],
            },
          ],
        };

        // Directly create a response object with the condition set to false
        // and repeating items that should be cleared
        const response: QuestionnaireResponse = {
          resourceType: 'QuestionnaireResponse',
          status: 'in-progress',
          item: [
            {
              linkId: 'condition',
              answer: [{ valueBoolean: false }], // Condition is false, should disable repeatingItem
            },
            {
              linkId: 'repeatingItem',
              answer: [{ valueString: 'Instance 1' }, { valueString: 'Instance 2' }, { valueString: 'Instance 3' }], // These should all be cleared since condition is false
            },
          ],
        };

        // Run enableWhen
        const result = runEnableWhen(testQuestionnaire, response);

        // The repeatingItem should have all instances removed
        const repeatingItem = result?.item?.find(i => i.linkId === 'repeatingItem');
        expect(repeatingItem?.answer).toEqual([]);
      });
    });

    describe('Rule 6: Proper context handling for repeated items', () => {
      it('should respect the full context path for nested repeated items', () => {
        // Test with nested repeating groups that have the same linkIds but different contexts
        const testQuestionnaire: Questionnaire = {
          resourceType: 'Questionnaire',
          status: 'active',
          item: [
            {
              linkId: 'outer',
              type: 'group',
              repeats: true,
              item: [
                {
                  linkId: 'inner',
                  type: 'group',
                  repeats: true,
                  item: [
                    { linkId: 'condition', type: 'boolean' },
                    {
                      linkId: 'dependent',
                      type: 'string',
                      enableWhen: [
                        {
                          question: 'condition',
                          operator: '=',
                          answerBoolean: true,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        };

        // Create a complex response with multiple nested repeating groups
        const response: QuestionnaireResponse = {
          resourceType: 'QuestionnaireResponse',
          status: 'in-progress',
          item: [
            {
              linkId: 'outer', // First outer instance
              item: [
                {
                  linkId: 'inner', // First inner instance in first outer
                  item: [
                    {
                      linkId: 'condition',
                      answer: [{ valueBoolean: true }], // Enabled
                    },
                    {
                      linkId: 'dependent',
                      answer: [{ valueString: 'First inner - should remain' }],
                    },
                  ],
                },
                {
                  linkId: 'inner', // Second inner instance in first outer
                  item: [
                    {
                      linkId: 'condition',
                      answer: [{ valueBoolean: false }], // Disabled
                    },
                    {
                      linkId: 'dependent',
                      answer: [{ valueString: 'Second inner - should be cleared' }],
                    },
                  ],
                },
              ],
            },
            {
              linkId: 'outer', // Second outer instance
              item: [
                {
                  linkId: 'inner', // First inner instance in second outer
                  item: [
                    {
                      linkId: 'condition',
                      answer: [{ valueBoolean: false }], // Disabled
                    },
                    {
                      linkId: 'dependent',
                      answer: [{ valueString: 'Third inner - should be cleared' }],
                    },
                  ],
                },
                {
                  linkId: 'inner', // Second inner instance in second outer
                  item: [
                    {
                      linkId: 'condition',
                      answer: [{ valueBoolean: true }], // Enabled
                    },
                    {
                      linkId: 'dependent',
                      answer: [{ valueString: 'Fourth inner - should remain' }],
                    },
                  ],
                },
              ],
            },
          ],
        };

        // Run enableWhen
        const result = runEnableWhen(testQuestionnaire, response);

        // Verify the results - complex nested structure
        const outerInstances = result?.item;

        if (outerInstances && outerInstances.length >= 2) {
          // First outer instance checks
          const firstOuterInners = outerInstances[0].item || [];

          // First inner in first outer - condition TRUE
          if (firstOuterInners.length > 0) {
            const firstInnerDependent = firstOuterInners[0].item?.find(i => i.linkId === 'dependent');
            expect(firstInnerDependent?.answer?.[0].valueString).toBe('First inner - should remain');
          }

          // Second inner in first outer - condition FALSE
          if (firstOuterInners.length > 1) {
            const secondInnerDependent = firstOuterInners[1].item?.find(i => i.linkId === 'dependent');

            expect(secondInnerDependent?.answer).toEqual([]);
          }

          // Second outer instance checks
          const secondOuterInners = outerInstances[1].item || [];

          // First inner in second outer - condition FALSE
          if (secondOuterInners.length > 0) {
            const thirdInnerDependent = secondOuterInners[0].item?.find(i => i.linkId === 'dependent');
            expect(thirdInnerDependent?.answer).toEqual([]);
          }

          // Second inner in second outer - condition TRUE
          if (secondOuterInners.length > 1) {
            const fourthInnerDependent = secondOuterInners[1].item?.find(i => i.linkId === 'dependent');
            expect(fourthInnerDependent?.answer?.[0].valueString).toBe('Fourth inner - should remain');
          }
        }
      });
    });
  });

  describe('custom', () => {
    it('custom q and qr input', () => {
      const q: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'test-nested-enablewhen',
        status: 'draft',
        meta: {
          security: [
            {
              code: '3',
              display: 'Helsehjelp (Full)',
              system: 'urn:oid:2.16.578.1.12.4.1.1.7618',
            },
          ],
        },
        item: [
          {
            linkId: '0ff00604-cf13-435d-80b6-474333d9531d',
            type: 'group',
            text: 'Container',
            item: [
              {
                linkId: '7932670f-5920-49b1-8bac-ae3bbdb772b1',
                type: 'group',
                text: 'Repeatable Group',
                item: [
                  {
                    linkId: '3399ab6e-b33f-488f-f738-a2c062ad32fb',
                    type: 'string',
                    text: 'repeatable text',
                    required: false,
                    repeats: true,
                  },
                  {
                    linkId: '306836ac-d08d-43f6-8cd4-308c5c93085a',
                    type: 'integer',
                    text: 'Number',
                    required: false,
                  },
                  {
                    linkId: 'ba57fe13-063c-496d-c5d2-af7026839844',
                    type: 'boolean',
                    text: 'Confermation with enable when',
                    item: [
                      {
                        linkId: '92cecf85-de58-417a-c187-d52121058811',
                        type: 'string',
                        text: 'text behind enableWhen',
                        required: false,
                        enableWhen: [
                          {
                            question: 'ba57fe13-063c-496d-c5d2-af7026839844',
                            operator: '=',
                            answerBoolean: true,
                          },
                        ],
                      },
                      {
                        linkId: 'b68bb243-b20b-42bb-9122-5b3c522badda',
                        type: 'string',
                        text: 'repeatable text behind enableWhen',
                        required: false,
                        enableWhen: [
                          {
                            question: 'ba57fe13-063c-496d-c5d2-af7026839844',
                            operator: '=',
                            answerBoolean: true,
                          },
                        ],
                        repeats: true,
                      },
                    ],
                    required: false,
                  },
                ],
                required: false,
                repeats: true,
              },
            ],
            required: false,
          },
        ],
      };

      const qr: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: '0ff00604-cf13-435d-80b6-474333d9531d',
            text: 'Container',
            item: [
              {
                linkId: '7932670f-5920-49b1-8bac-ae3bbdb772b1',
                text: 'Repeatable Group',
                item: [
                  {
                    linkId: '3399ab6e-b33f-488f-f738-a2c062ad32fb',
                    text: 'repeatable text',
                    answer: [
                      {
                        valueString: 'df',
                      },
                    ],
                  },
                  {
                    linkId: '3399ab6e-b33f-488f-f738-a2c062ad32fb',
                    text: 'repeatable text',
                  },
                  {
                    linkId: '3399ab6e-b33f-488f-f738-a2c062ad32fb',
                    text: 'repeatable text',
                    answer: [
                      {
                        valueString: 'hjkhkj',
                      },
                    ],
                  },
                  {
                    linkId: '306836ac-d08d-43f6-8cd4-308c5c93085a',
                    text: 'Number',
                    answer: [
                      {
                        valueInteger: 67,
                      },
                    ],
                  },
                  {
                    linkId: 'ba57fe13-063c-496d-c5d2-af7026839844',
                    text: 'Confermation with enable when',
                    answer: [
                      {
                        valueBoolean: false,
                        item: [
                          {
                            linkId: '92cecf85-de58-417a-c187-d52121058811',
                            text: 'text behind enableWhen',
                            answer: [
                              {
                                valueString: 'hgf',
                              },
                            ],
                          },
                          {
                            linkId: 'b68bb243-b20b-42bb-9122-5b3c522badda',
                            text: 'repeatable text behind enableWhen',
                            answer: [
                              {
                                valueString: 'hkjhjk',
                              },
                            ],
                          },
                          {
                            linkId: 'b68bb243-b20b-42bb-9122-5b3c522badda',
                            text: 'repeatable text behind enableWhen',
                            answer: [
                              {
                                valueString: 'fgh',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };
      const result = runEnableWhen(q, qr);

      // Log the result for debugging

      // Navigate to the specific answer we want to check
      const containerItem = result?.item?.[0];
      const repeatableGroup = containerItem?.item?.[0];
      const confirmationWithEnableWhen = repeatableGroup?.item?.find(i => i.linkId === 'ba57fe13-063c-496d-c5d2-af7026839844');

      // Check that the confirmation item has a valueBoolean: false answer
      expect(confirmationWithEnableWhen?.answer?.[0].valueBoolean).toBe(false);

      // Check that the item structure is preserved but answers are cleared
      const childItems = confirmationWithEnableWhen?.answer?.[0].item;
      expect(childItems).toBeDefined();
      expect(childItems?.length).toBe(3);

      // Check that the first child item has no answer
      const firstChildItem = childItems?.[0];
      expect(firstChildItem?.linkId).toBe('92cecf85-de58-417a-c187-d52121058811');
      expect(firstChildItem?.answer).toHaveLength(0);

      // Check that the second child item (first repeatable) has no answer
      const secondChildItem = childItems?.[1];
      expect(secondChildItem?.linkId).toBe('b68bb243-b20b-42bb-9122-5b3c522badda');
      expect(firstChildItem?.answer).toHaveLength(0);

      // Check that the third child item (second repeatable) has no answer
      const thirdChildItem = childItems?.[2];
      expect(thirdChildItem?.linkId).toBe('b68bb243-b20b-42bb-9122-5b3c522badda');
      expect(firstChildItem?.answer).toHaveLength(0);

      // Alternative: do a direct structure comparison
      expect(confirmationWithEnableWhen?.answer).toEqual([
        {
          valueBoolean: false,
          item: [
            {
              answer: [],
              linkId: '92cecf85-de58-417a-c187-d52121058811',
              text: 'text behind enableWhen',
            },
            {
              answer: [],
              linkId: 'b68bb243-b20b-42bb-9122-5b3c522badda',
              text: 'repeatable text behind enableWhen',
            },
            {
              answer: [],
              linkId: 'b68bb243-b20b-42bb-9122-5b3c522badda',
              text: 'repeatable text behind enableWhen',
            },
          ],
        },
      ]);
    });
    it('custom q and qr input - 2', () => {
      const q: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'test-nested-enablewhen',
        status: 'draft',
        meta: {
          security: [
            {
              code: '3',
              display: 'Helsehjelp (Full)',
              system: 'urn:oid:2.16.578.1.12.4.1.1.7618',
            },
          ],
        },
        item: [
          {
            linkId: '0ff00604-cf13-435d-80b6-474333d9531d',
            type: 'group',
            text: 'Container',
            item: [
              {
                linkId: '7932670f-5920-49b1-8bac-ae3bbdb772b1',
                type: 'group',
                text: 'Repeatable Group',
                item: [
                  {
                    linkId: '3399ab6e-b33f-488f-f738-a2c062ad32fb',
                    type: 'string',
                    text: 'repeatable text',
                    required: false,
                    repeats: true,
                  },
                  {
                    linkId: '306836ac-d08d-43f6-8cd4-308c5c93085a',
                    type: 'integer',
                    text: 'Number',
                    required: false,
                  },
                  {
                    linkId: 'ba57fe13-063c-496d-c5d2-af7026839844',
                    type: 'boolean',
                    text: 'Confermation with enable when',
                    item: [
                      {
                        linkId: '92cecf85-de58-417a-c187-d52121058811',
                        type: 'string',
                        text: 'text behind enableWhen',
                        required: false,
                        enableWhen: [
                          {
                            question: 'ba57fe13-063c-496d-c5d2-af7026839844',
                            operator: '=',
                            answerBoolean: true,
                          },
                        ],
                      },
                      {
                        linkId: 'b68bb243-b20b-42bb-9122-5b3c522badda',
                        type: 'string',
                        text: 'repeatable text behind enableWhen',
                        required: false,
                        enableWhen: [
                          {
                            question: 'ba57fe13-063c-496d-c5d2-af7026839844',
                            operator: '=',
                            answerBoolean: true,
                          },
                        ],
                        repeats: true,
                      },
                    ],
                    required: false,
                  },
                ],
                required: false,
                repeats: true,
              },
            ],
            required: false,
          },
        ],
      };

      const qr: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: '0ff00604-cf13-435d-80b6-474333d9531d',
            text: 'Container',
            item: [
              {
                linkId: '7932670f-5920-49b1-8bac-ae3bbdb772b1',
                text: 'Repeatable Group',
                item: [
                  {
                    linkId: '3399ab6e-b33f-488f-f738-a2c062ad32fb',
                    text: 'repeatable text',
                  },
                  {
                    linkId: '306836ac-d08d-43f6-8cd4-308c5c93085a',
                    text: 'Number',
                  },
                  {
                    linkId: 'ba57fe13-063c-496d-c5d2-af7026839844',
                    text: 'Confermation with enable when',
                    answer: [
                      {
                        valueBoolean: false,
                        item: [
                          {
                            linkId: '92cecf85-de58-417a-c187-d52121058811',
                            text: 'text behind enableWhen',
                            answer: [
                              {
                                valueString: 'asd',
                              },
                            ],
                          },
                          {
                            linkId: 'b68bb243-b20b-42bb-9122-5b3c522badda',
                            text: 'repeatable text behind enableWhen',
                            answer: [
                              {
                                valueString: 'asd',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                linkId: '7932670f-5920-49b1-8bac-ae3bbdb772b1',
                text: 'Repeatable Group',
                item: [
                  {
                    linkId: '3399ab6e-b33f-488f-f738-a2c062ad32fb',
                    text: 'repeatable text',
                  },
                  {
                    linkId: '306836ac-d08d-43f6-8cd4-308c5c93085a',
                    text: 'Number',
                    answer: [
                      {
                        valueInteger: 234,
                      },
                    ],
                  },
                  {
                    linkId: 'ba57fe13-063c-496d-c5d2-af7026839844',
                    text: 'Confermation with enable when',
                    answer: [
                      {
                        valueBoolean: false,
                      },
                      {
                        item: [
                          {
                            linkId: '92cecf85-de58-417a-c187-d52121058811',
                            answer: [
                              {
                                valueString: 'fsdf',
                              },
                            ],
                            text: 'text behind enableWhen',
                          },
                          {
                            linkId: 'b68bb243-b20b-42bb-9122-5b3c522badda',
                            answer: [
                              {
                                valueString: 'sdf',
                              },
                            ],
                            text: 'repeatable text behind enableWhen',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = runEnableWhen(q, qr);

      // TEST FIRST REPEATABLE GROUP (Format 1)
      const containerItem = result?.item?.[0];
      const firstRepeatableGroup = containerItem?.item?.[0];
      const firstConfirmation = firstRepeatableGroup?.item?.find(i => i.linkId === 'ba57fe13-063c-496d-c5d2-af7026839844');

      // Check confirmation value is preserved
      expect(firstConfirmation?.answer?.[0].valueBoolean).toBe(false);

      // Check item structure is preserved
      const firstChildItems = firstConfirmation?.answer?.[0].item;
      expect(firstChildItems).toBeDefined();
      expect(firstChildItems?.length).toBe(2);

      // Check that answers are cleared in first child
      const firstFirstChild = firstChildItems?.[0];
      expect(firstFirstChild?.linkId).toBe('92cecf85-de58-417a-c187-d52121058811');
      expect(firstFirstChild?.answer).toEqual([]);

      // Check that answers are cleared in second child
      const firstSecondChild = firstChildItems?.[1];
      expect(firstSecondChild?.linkId).toBe('b68bb243-b20b-42bb-9122-5b3c522badda');
      expect(firstSecondChild?.answer).toEqual([]);

      // TEST SECOND REPEATABLE GROUP (Format 2)
      const secondRepeatableGroup = containerItem?.item?.[1];
      const secondConfirmation = secondRepeatableGroup?.item?.find(i => i.linkId === 'ba57fe13-063c-496d-c5d2-af7026839844');

      // Check confirmation value is preserved
      expect(secondConfirmation?.answer?.[0].valueBoolean).toBe(false);

      // Check that second answer with items exists
      expect(secondConfirmation?.answer?.length).toBe(2);

      // Check item structure is preserved in second answer
      const secondChildItems = secondConfirmation?.answer?.[1].item;
      expect(secondChildItems).toBeDefined();
      expect(secondChildItems?.length).toBe(2);

      // Check that answers are cleared in first child
      const secondFirstChild = secondChildItems?.[0];
      expect(secondFirstChild?.linkId).toBe('92cecf85-de58-417a-c187-d52121058811');
      expect(secondFirstChild?.answer).toEqual([]);

      // Check that answers are cleared in second child
      const secondSecondChild = secondChildItems?.[1];
      expect(secondSecondChild?.linkId).toBe('b68bb243-b20b-42bb-9122-5b3c522badda');
      expect(secondSecondChild?.answer).toEqual([]);

      // Full structure comparison for first group
      expect(firstConfirmation?.answer).toEqual([
        {
          valueBoolean: false,
          item: [
            {
              linkId: '92cecf85-de58-417a-c187-d52121058811',
              text: 'text behind enableWhen',
              answer: [],
            },
            {
              linkId: 'b68bb243-b20b-42bb-9122-5b3c522badda',
              text: 'repeatable text behind enableWhen',
              answer: [],
            },
          ],
        },
      ]);

      // Full structure comparison for second group
      expect(secondConfirmation?.answer).toEqual([
        {
          valueBoolean: false,
        },
        {
          item: [
            {
              linkId: '92cecf85-de58-417a-c187-d52121058811',
              text: 'text behind enableWhen',
              answer: [],
            },
            {
              linkId: 'b68bb243-b20b-42bb-9122-5b3c522badda',
              text: 'repeatable text behind enableWhen',
              answer: [],
            },
          ],
        },
      ]);
    });
    it('should only clear answers for specific instances when disabled in repeating groups', () => {
      // Create a questionnaire with multiple repeating groups containing the same linkIds
      const testQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'container',
            type: 'group',
            item: [
              {
                linkId: 'repeatingGroup',
                type: 'group',
                repeats: true,
                item: [
                  {
                    linkId: 'controlCondition',
                    type: 'boolean',
                  },
                  {
                    linkId: 'targetItem',
                    type: 'string',
                    enableWhen: [
                      {
                        question: 'controlCondition',
                        operator: '=',
                        answerBoolean: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: 'container',
            item: [
              {
                linkId: 'repeatingGroup', // First instance
                item: [
                  {
                    linkId: 'controlCondition',
                    answer: [{ valueBoolean: true }],
                  },
                  {
                    linkId: 'targetItem',
                    answer: [{ valueString: 'First instance value - should stay' }],
                  },
                ],
              },
              {
                linkId: 'repeatingGroup', // Second instance
                item: [
                  {
                    linkId: 'controlCondition',
                    answer: [{ valueBoolean: false }],
                  },
                  {
                    linkId: 'targetItem',
                    answer: [{ valueString: 'Second instance value - should be cleared' }],
                  },
                ],
              },
              {
                linkId: 'repeatingGroup', // Third instance
                item: [
                  {
                    linkId: 'controlCondition',
                    answer: [{ valueBoolean: true }],
                  },
                  {
                    linkId: 'targetItem',
                    answer: [{ valueString: 'Third instance value - should stay' }],
                  },
                ],
              },
            ],
          },
        ],
      };

      // Run enableWhen
      const result = runEnableWhen(testQuestionnaire, response);

      // Get the repeating group instances from the result
      const container = result?.item?.[0];
      const repeatingGroups = container?.item;

      expect(repeatingGroups?.length).toBe(3);

      if (repeatingGroups && repeatingGroups.length >= 3) {
        // First instance (condition=true): targetItem should keep its value
        const firstTargetItem = repeatingGroups[0].item?.find(i => i.linkId === 'targetItem');
        expect(firstTargetItem?.answer?.[0].valueString).toBe('First instance value - should stay');

        // Second instance (condition=false): targetItem should be cleared
        const secondTargetItem = repeatingGroups[1].item?.find(i => i.linkId === 'targetItem');
        expect(secondTargetItem?.answer).toEqual([]);

        // Third instance (condition=true): targetItem should keep its value
        const thirdTargetItem = repeatingGroups[2].item?.find(i => i.linkId === 'targetItem');
        expect(thirdTargetItem?.answer?.[0].valueString).toBe('Third instance value - should stay');
      }

      // Additional check: count how many targetItems have answers
      // Should be exactly 2 (first and third instances)
      let itemsWithAnswers = 0;
      result?.item?.[0].item?.forEach(group => {
        const targetItem = group.item?.find(i => i.linkId === 'targetItem');
        if (targetItem?.answer && targetItem.answer.length > 0) {
          itemsWithAnswers++;
        }
      });

      expect(itemsWithAnswers).toBe(2);
    });
  });

  describe('enableWhen with nested repeating groups', () => {
    let q: Questionnaire;
    let qr: QuestionnaireResponse;
    beforeEach(() => {
      q = {
        resourceType: 'Questionnaire',
        id: 'test-nested-enablewhen',
        status: 'draft',
        meta: {
          security: [
            {
              code: '3',
              display: 'Helsehjelp (Full)',
              system: 'urn:oid:2.16.578.1.12.4.1.1.7618',
            },
          ],
        },
        item: [
          {
            linkId: '0ff00604-cf13-435d-80b6-474333d9531d',
            type: 'group',
            text: 'Container',
            item: [
              {
                linkId: '7932670f-5920-49b1-8bac-ae3bbdb772b1',
                type: 'group',
                text: 'Repeatable Group',
                item: [
                  {
                    linkId: '3399ab6e-b33f-488f-f738-a2c062ad32fb',
                    type: 'string',
                    text: 'repeatable text',
                    required: false,
                    repeats: true,
                  },
                  {
                    linkId: '306836ac-d08d-43f6-8cd4-308c5c93085a',
                    type: 'integer',
                    text: 'Number',
                    required: false,
                  },
                  {
                    linkId: 'ba57fe13-063c-496d-c5d2-af7026839844',
                    type: 'boolean',
                    text: 'Confermation with enable when',
                    item: [
                      {
                        linkId: '92cecf85-de58-417a-c187-d52121058811',
                        type: 'string',
                        text: 'text behind enableWhen',
                        required: false,
                        enableWhen: [
                          {
                            question: 'ba57fe13-063c-496d-c5d2-af7026839844',
                            operator: '=',
                            answerBoolean: true,
                          },
                        ],
                      },
                      {
                        linkId: 'b68bb243-b20b-42bb-9122-5b3c522badda',
                        type: 'string',
                        text: 'repeatable text behind enableWhen',
                        required: false,
                        enableWhen: [
                          {
                            question: 'ba57fe13-063c-496d-c5d2-af7026839844',
                            operator: '=',
                            answerBoolean: true,
                          },
                        ],
                        repeats: true,
                      },
                    ],
                    required: false,
                  },
                ],
                required: false,
                repeats: true,
              },
            ],
            required: false,
          },
        ],
      };

      // Your exact QuestionnaireResponse
      qr = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: [
          {
            linkId: '0ff00604-cf13-435d-80b6-474333d9531d',
            text: 'Container',
            item: [
              {
                linkId: '7932670f-5920-49b1-8bac-ae3bbdb772b1',
                text: 'Repeatable Group',
                item: [
                  {
                    linkId: '3399ab6e-b33f-488f-f738-a2c062ad32fb',
                    text: 'repeatable text',
                  },
                  {
                    linkId: '306836ac-d08d-43f6-8cd4-308c5c93085a',
                    text: 'Number',
                  },
                  {
                    linkId: 'ba57fe13-063c-496d-c5d2-af7026839844',
                    text: 'Confermation with enable when',
                    answer: [
                      {
                        valueBoolean: true,
                        item: [
                          {
                            linkId: '92cecf85-de58-417a-c187-d52121058811',
                            text: 'text behind enableWhen',
                            answer: [
                              {
                                valueString: 'sdf',
                              },
                            ],
                          },
                          {
                            linkId: 'b68bb243-b20b-42bb-9122-5b3c522badda',
                            text: 'repeatable text behind enableWhen',
                            answer: [
                              {
                                valueString: 'dsf',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                linkId: '7932670f-5920-49b1-8bac-ae3bbdb772b1',
                text: 'Repeatable Group',
                item: [
                  {
                    linkId: '3399ab6e-b33f-488f-f738-a2c062ad32fb',
                    text: 'repeatable text',
                  },
                  {
                    linkId: '306836ac-d08d-43f6-8cd4-308c5c93085a',
                    text: 'Number',
                  },
                  {
                    linkId: 'ba57fe13-063c-496d-c5d2-af7026839844',
                    text: 'Confermation with enable when',
                    answer: [
                      {
                        valueBoolean: false,
                      },
                      {
                        item: [
                          {
                            linkId: '92cecf85-de58-417a-c187-d52121058811',
                            answer: [
                              {
                                valueString: 'sdf',
                              },
                            ],
                            text: 'text behind enableWhen',
                          },
                          {
                            linkId: 'b68bb243-b20b-42bb-9122-5b3c522badda',
                            answer: [
                              {
                                valueString: 'sdf',
                              },
                            ],
                            text: 'repeatable text behind enableWhen',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };
    });
    it('should correctly handle enableWhen in repeating groups with different structures', () => {
      // Your exact questionnaire definition

      console.log('TEST: Running enableWhen with nested repeating groups test');
      const result = runEnableWhen(q, qr);

      // Debug the resulting output
      console.log('TEST RESULT:', JSON.stringify(result, null, 2));

      // Get references to both repeatable groups
      const container = result?.item?.[0];
      const repeatingGroups = container?.item;
      expect(repeatingGroups?.length).toBe(2);

      // 1. Test first repeatable group (where valueBoolean = true)
      if (repeatingGroups && repeatingGroups.length >= 1) {
        const firstGroup = repeatingGroups[0];
        const confirmationItem = firstGroup.item?.find(i => i.linkId === 'ba57fe13-063c-496d-c5d2-af7026839844');

        // Check that the confirmation value is still true
        expect(confirmationItem?.answer?.[0].valueBoolean).toBe(true);

        // Check that the child items exist in the item array of the answer
        const childItems = confirmationItem?.answer?.[0].item;
        expect(childItems).toBeDefined();
        expect(childItems?.length).toBe(2);

        // Check that the answers for child items are preserved
        const firstChild = childItems?.find(i => i.linkId === '92cecf85-de58-417a-c187-d52121058811');
        expect(firstChild?.answer?.[0].valueString).toBe('sdf');

        const secondChild = childItems?.find(i => i.linkId === 'b68bb243-b20b-42bb-9122-5b3c522badda');
        expect(secondChild?.answer?.[0].valueString).toBe('dsf');
      }

      // 2. Test second repeatable group (where valueBoolean = false)
      if (repeatingGroups && repeatingGroups.length >= 2) {
        const secondGroup = repeatingGroups[1];
        const confirmationItem = secondGroup.item?.find(i => i.linkId === 'ba57fe13-063c-496d-c5d2-af7026839844');

        // Check that the first answer still has valueBoolean = false
        expect(confirmationItem?.answer?.[0].valueBoolean).toBe(false);

        // Make sure we have the second answer with item structure
        expect(confirmationItem?.answer?.length).toBeGreaterThanOrEqual(2);
        const secondAnswer = confirmationItem?.answer?.[1];
        expect(secondAnswer).toBeDefined();

        // The child items should exist but have empty answers
        const childItems = secondAnswer?.item;
        expect(childItems).toBeDefined();
        expect(childItems?.length).toBe(2);

        // Check that both child items have their answers cleared
        const firstChild = childItems?.find(i => i.linkId === '92cecf85-de58-417a-c187-d52121058811');
        expect(firstChild?.answer).toEqual([]);

        const secondChild = childItems?.find(i => i.linkId === 'b68bb243-b20b-42bb-9122-5b3c522badda');
        expect(secondChild?.answer).toEqual([]);
      }
    });

    it('should handle the case where an item has both a boolean value and child items', () => {
      // Same questionnaire as above
      const q2: Questionnaire = { ...q };

      // Create a slightly different response to test another scenario
      const qr2: QuestionnaireResponse = {
        ...qr,
      };

      // Change the first group to have false and the second to have true
      if (qr2.item && qr2.item[0] && qr2.item[0].item && qr2.item[0].item[0] && qr2.item[0].item[0].item && qr2.item[0].item[0].item[2]) {
        qr2.item[0].item[0].item[2].answer = [{ valueBoolean: false }];
      }
      if (qr2.item?.[0]?.item?.[1]?.item?.[2]?.answer?.length) {
        qr2.item[0].item[1].item[2].answer[0].valueBoolean = true;
      }

      const result = runEnableWhen(q2, qr2);

      // First group should have cleared answers
      const firstConfirmation = result?.item?.[0].item?.[0].item?.[2];
      if (firstConfirmation?.answer?.[0].item) {
        const firstGroupFirstChild = firstConfirmation.answer[0].item.find(i => i.linkId === '92cecf85-de58-417a-c187-d52121058811');
        expect(firstGroupFirstChild?.answer).toEqual([]);
      }

      // Second group should have preserved answers
      const secondConfirmation = result?.item?.[0].item?.[1].item?.[2];
      if (secondConfirmation?.answer?.[1]?.item) {
        const secondGroupFirstChild = secondConfirmation.answer[1].item.find(i => i.linkId === '92cecf85-de58-417a-c187-d52121058811');
        expect(secondGroupFirstChild?.answer?.[0].valueString).toBe('sdf');
      }
    });
  });
});
