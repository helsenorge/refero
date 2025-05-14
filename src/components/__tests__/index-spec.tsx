import React from 'react';

import userEvent from '@testing-library/user-event';
import { Questionnaire, QuestionnaireItem } from 'fhir/r4';

import '../../util/__tests__/defineFetch';
import RenderingOptionsData from './__data__/renderingOptions';
import { selectCheckboxOption } from '../../../test/selectors';
import itemcontrol from '../../constants/itemcontrol';
import { createItemControlExtension, findItemById } from '../__tests__/utils';
import ChoiceCopyFrom from './__data__/copyFrom/choice';
import { renderRefero, screen, waitFor } from '../../../test/test-utils';

describe('Component renders help items', () => {
  it('help button should be visible and control the help element', async () => {
    let expectedOpeningStatus = false;

    const helpButtonCb = (
      item: QuestionnaireItem,
      helpItem: QuestionnaireItem,
      helpType: string,
      helpText: string,
      opening: boolean
    ): JSX.Element => {
      expect(item.linkId).toBe('1');
      expect(helpItem.linkId).toBe('1.1');
      expect(helpText).toBe('help text');
      expect(helpType).toBe(itemcontrol.HELP);
      expect(opening).toBe(expectedOpeningStatus);

      return <div className="helpButton">{'help button'}</div>;
    };

    const helpElementCb = (
      item: QuestionnaireItem,
      helpItem: QuestionnaireItem,
      helpType: string,
      helpText: string,
      opening: boolean
    ): JSX.Element => {
      expect(item.linkId).toBe('1');
      expect(helpItem.linkId).toBe('1.1');
      expect(helpText).toBe('help text');
      expect(helpType).toBe(itemcontrol.HELP);
      expect(opening).toBe(expectedOpeningStatus);

      return opening ? <div className="helpElement">{'help element'}</div> : <React.Fragment />;
    };

    // Render schema with 1 help button
    const { container } = await createWrapper(questionnaireWithHelp(), helpButtonCb, helpElementCb);

    // eslint-disable-next-line testing-library/no-node-access
    expect(container.querySelectorAll('.helpButton')).toHaveLength(1);
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.querySelectorAll('.helpElement')).toHaveLength(0);

    // click help button to open the help element
    expectedOpeningStatus = true;
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.click(container.querySelectorAll('.helpButton')[0]);
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.querySelectorAll('.helpElement')).toHaveLength(1);

    // click help button to close the help element
    expectedOpeningStatus = false;
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.click(container.querySelectorAll('.helpButton')[0]);
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.querySelectorAll('.helpElement')).toHaveLength(0);
  });
});

describe('repeat with enableWhen', () => {
  it('When we add a section with repeat, the enableWhen component should be hidden per default', async () => {
    createWrapper(questionnaireWithRepeatedEnableWhens());
    // clicking the repeat button, repeats the elements
    expect(screen.queryAllByLabelText(/Checkbox/i)).toHaveLength(1);
    expect(screen.queryByLabelText(/enableWhen/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(/Checkbox/i));
    await userEvent.type(await screen.findByLabelText(/enableWhen/i), '2');

    await userEvent.click(screen.getByTestId(/-repeat-button/i));

    expect(screen.getByLabelText(/enableWhen/i)).toBeInTheDocument();
    expect(screen.queryAllByLabelText(/Checkbox/i)).toHaveLength(2);

    // Click second boolean input, and enableWhen component should be enabled
    await userEvent.click(screen.queryAllByLabelText(/Checkbox/i)[1]);
    expect(screen.getAllByLabelText(/enableWhen/i)).toHaveLength(2);
  });
});

describe('Coding system (RenderingOptions)', () => {
  it('Only displays items that have system code as KunSkjemautfyll or Default', async () => {
    const { container } = await createWrapper(RenderingOptionsData);

    expect(findItemById('item_group1_default', container)).toBeInTheDocument();
    expect(findItemById('item_group1_default_text', container)).toBeInTheDocument();
    expect(findItemById('item_group1_default_checkbox', container)).toBeInTheDocument();
    expect(findItemById('item_group2', container)).toBeInTheDocument();
    expect(findItemById('item_group2_kunskjemautfyll_text', container)).toBeInTheDocument();
    expect(findItemById('item_group4_kunskjemautfyll', container)).toBeInTheDocument();
    expect(findItemById('item_group4_kunskjemautfyll_text', container)).toBeInTheDocument();
    expect(findItemById('item_group4_kunskjemautfyll_checkbox', container)).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.querySelector('item_group2_kunpdf_checkbox')).toBeFalsy();
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.querySelector('item_group3_kunpdf')).toBeFalsy();
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.querySelector('item_group3_kunpdf_text')).toBeFalsy();
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.querySelector('item_group3_kunpdf_checkbox')).toBeFalsy();
  });
});

describe('Copying from ...', () => {
  describe('Choice', () => {
    it('Choice selected options displays in data-receiver element', async () => {
      const { container } = await createWrapper(ChoiceCopyFrom);
      await selectCheckboxOption('Option 1');
      expect(findItemById('data-receiver-choice-id', container)).toBeInTheDocument();
    });
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(
  questionnaire: Questionnaire,
  helpButtonCb?: (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, help: string, opening: boolean) => JSX.Element,
  helpElementCb?: (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, help: string, opening: boolean) => JSX.Element
) {
  return await waitFor(
    async () => await renderRefero({ questionnaire, props: { onRequestHelpButton: helpButtonCb, onRequestHelpElement: helpElementCb } })
  );
}

function questionnaireWithRepeatedEnableWhens(): Questionnaire {
  return {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
      {
        linkId: '8',
        text: 'Gruppe',
        type: 'group',
        item: [
          {
            linkId: '8.1',
            text: 'Gruppe med repeat',
            type: 'group',
            repeats: true,
            item: [
              {
                linkId: '8.1.1',
                text: 'Checkbox',
                type: 'boolean',
              },
              {
                linkId: '8.1.2',
                text: 'enableWhen',
                type: 'integer',
                enableBehavior: 'any',
                enableWhen: [
                  {
                    question: '8.1.1',
                    answerBoolean: true,
                    operator: '=',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

function questionnaireWithHelp(): Questionnaire {
  return {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
      {
        linkId: '1',
        type: 'group',
        text: 'Group Header',
        item: [
          {
            linkId: '1.1',
            type: 'text',
            text: 'help text',
            extension: [createItemControlExtension(itemcontrol.HELP)],
          },
        ],
      },
    ],
  };
}
