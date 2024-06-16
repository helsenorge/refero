import * as React from 'react';
import { render, screen } from './test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';

import { Questionnaire, QuestionnaireItem } from 'fhir/r4';

import '../../util/__tests__/defineFetch';
import itemControlConstants from '../../constants/itemcontrol';
import rootReducer from '../../reducers';
import { Resources } from '../../util/resources';
import { ReferoContainer } from '../index';
import RenderingOptionsData from './__data__/renderingOptions';
import ChoiceCopyFrom from './__data__/copyFrom/choice';
import { createItemControlExtension, findItemById } from '../__tests__/utils';
import itemcontrol from '../../constants/itemcontrol';
import { selectCheckboxOption } from './test-utils/selectors';

describe('Component renders help items', () => {
  it('help button should be visible and control the help element', () => {
    let expectedOpeningStatus = false;

    const helpButtonCb = (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, helpText: string, opening: boolean) => {
      expect(item.linkId).toBe('1');
      expect(helpItem.linkId).toBe('1.1');
      expect(helpText).toBe('help text');
      expect(helpType).toBe(itemControlConstants.HELP);
      expect(opening).toBe(expectedOpeningStatus);

      return <div className="helpButton">{'help button'}</div>;
    };

    const helpElementCb = (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, helpText: string, opening: boolean) => {
      expect(item.linkId).toBe('1');
      expect(helpItem.linkId).toBe('1.1');
      expect(helpText).toBe('help text');
      expect(helpType).toBe(itemControlConstants.HELP);
      expect(opening).toBe(expectedOpeningStatus);

      return opening ? <div className="helpElement">{'help element'}</div> : <React.Fragment />;
    };

    // Render schema with 1 help button
    const { container } = createWrapper(questionnaireWithHelp(), helpButtonCb, helpElementCb);

    expect(container.querySelectorAll('.helpButton')).toHaveLength(1);
    expect(container.querySelectorAll('.helpElement')).toHaveLength(0);

    // click help button to open the help element
    expectedOpeningStatus = true;
    userEvent.click(container.querySelectorAll('.helpButton')[0]);
    expect(container.querySelectorAll('.helpElement')).toHaveLength(1);

    // click help button to close the help element
    expectedOpeningStatus = false;
    userEvent.click(container.querySelectorAll('.helpButton')[0]);
    expect(container.querySelectorAll('.helpElement')).toHaveLength(0);
  });
});

describe('repeat with enableWhen', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(() => {
      return {};
    });
  });

  it('When we add a section with repeat, the enableWhen component should be hidden per default', () => {
    const { container } = createWrapper(questionnaireWithRepeatedEnableWhens());

    // clicking the repeat button, repeats the elements
    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(1);

    userEvent.click(screen.getByTestId(/-repeat-button/i));
    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(2);

    // no enableWhen components should be visible
    expect(container.querySelectorAll('input[type="text"]')).toHaveLength(0);

    // Click first boolean input, and enableWhen component should be enabled
    userEvent.click(container.querySelectorAll('input[type="checkbox"]')[0]);
    expect(container.querySelectorAll('input[type="text"]')).toHaveLength(1);

    // Click last boolean input, and enableWhen component should be enabled
    userEvent.click(container.querySelectorAll('input[type="checkbox"]')[1]);
    expect(container.querySelectorAll('input[type="text"]')).toHaveLength(2);
  });
});

describe('Coding system (RenderingOptions)', () => {
  it('Only displays items that have system code as KunSkjemautfyll or Default', () => {
    const { container } = createWrapper(RenderingOptionsData);

    expect(findItemById('item_group1_default', container)).toBeInTheDocument();
    expect(findItemById('item_group1_default_text', container)).toBeInTheDocument();
    expect(findItemById('item_group1_default_checkbox', container)).toBeInTheDocument();
    expect(findItemById('item_group2', container)).toBeInTheDocument();
    expect(findItemById('item_group2_kunskjemautfyll_text', container)).toBeInTheDocument();
    expect(findItemById('item_group4_kunskjemautfyll', container)).toBeInTheDocument();
    expect(findItemById('item_group4_kunskjemautfyll_text', container)).toBeInTheDocument();
    expect(findItemById('item_group4_kunskjemautfyll_checkbox', container)).toBeInTheDocument();

    expect(container.querySelector('item_group2_kunpdf_checkbox')).toBeFalsy();
    expect(container.querySelector('item_group3_kunpdf')).toBeFalsy();
    expect(container.querySelector('item_group3_kunpdf_text')).toBeFalsy();
    expect(container.querySelector('item_group3_kunpdf_checkbox')).toBeFalsy();
  });
});

describe('Copying from ...', () => {
  describe('Choice', () => {
    it('Choice selected options displays in data-receiver element', async () => {
      const { container } = createWrapper(ChoiceCopyFrom);
      await selectCheckboxOption('Option 1');
      expect(findItemById('item_data-receiver-choice-id', container)).toBeInTheDocument();
    });
  });
});

function createWrapper(
  questionnaire: Questionnaire,
  helpButtonCb?: (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, help: string, opening: boolean) => JSX.Element,
  helpElementCb?: (item: QuestionnaireItem, helpItem: QuestionnaireItem, helpType: string, help: string, opening: boolean) => JSX.Element
) {
  const store = createStore(rootReducer, applyMiddleware(thunk));
  return render(
    <ReferoContainer
      loginButton={<React.Fragment />}
      authorized={true}
      onCancel={() => {}}
      onSave={() => {}}
      onSubmit={() => {}}
      resources={{} as Resources}
      questionnaire={questionnaire}
      onRequestHelpButton={helpButtonCb}
      onRequestHelpElement={helpElementCb}
    />,
    {
      store,
    }
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
                type: 'string',
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
