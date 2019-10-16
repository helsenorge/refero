import * as React from 'react';
import { renderPrefix, getText } from '../../../util/index';
import { QuestionnaireItem } from '../../../types/fhir';

interface Props {
  item: QuestionnaireItem;
  checked: boolean;
}

const pdf: React.SFC<Props> = ({ item, checked, children }) => {
  return (
    <div>
      {/* eslint-disable react/jsx-no-literals */}
      {checked ? <b>[ X ]</b> : <b>[&nbsp;&nbsp;&nbsp;&nbsp;]</b>} {`${renderPrefix(item)} ${getText(item)}`}
      {children ? (
        <span>
          <br />
          {children}
        </span>
      ) : null}
      <br />
      <br />
    </div>
  );
};

export default pdf;
