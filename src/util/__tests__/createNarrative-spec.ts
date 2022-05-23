import { createNarrative } from '../createNarrative';
import { dataModel } from './__data__/testDataModel';
describe('generateNarrative', () => {
  it('should not fail on empty input', () => {
    expect(createNarrative(null)).toEqual('');
  });

  it('should create narrative correct', () => {
    const expectedResult =
      '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>string1. text?</b></p><p>test svar</p><p><b>string2.</b></p><p>string2answer</p><p><b>string3.</b></p><p>string3answer</p><p><b>boolean1.</b></p><p>true</p><p><b>boolean2.</b></p><p>true</p><p><b>decimal1.</b></p><p>2.5</p><p><b>decimal2.</b></p><p>3</p><p><b>integer1.</b></p><p>888</p><p><b>integer2.</b></p><p>888</p><p><b>date1.</b></p><p>2018-01-01T00:00:00.000Z</p><p><b>date2.</b></p><p>2017-01-01T00:00:00.000Z</p><p><b>datetime1.</b></p><p>2018-05-18T10:28:45.000Z</p><p><b>datetime2.</b></p><p>2017-11-18T10:28:45.000Z</p><p><b>time1.</b></p><p>10:28</p><p><b>time2.</b></p><p>18:28</p><p><b>code1.</b></p><p>code1answer</p><p><b>code2.</b></p><p>code2answer</p><p><b>t0.</b></p><p>test string svar</p><p><b>t11.</b></p><p><b>t21.</b></p><p><b>t31.abc.</b></p><p><b>t32.def.</b></p><p><b>t41.</b></p><p>test string svar2</p><p><b>t22.</b></p><p><b>t12.</b></p><p><b>group1.</b></p><p><b>group1.1.</b></p><p><b>group1.2.</b></p><p>group1.2string</p><p><b>group1.2.1.</b></p><p><b>group1.2.2.</b></p><p><b>group1.2.</b></p><p><b>group1.2.1.</b></p><p><b>group1.2.2.</b></p><p><b>group1.</b></p><p><b>group1.1.</b></p><p>group1.1string</p><p><b>group1.2.</b></p><p>group1.2string</p><p><b>group1.2.1.</b></p><p><b>group1.2.2.</b></p><p><b>reference1.</b></p><p>http://ehelse.no/Endpoint/1</p><p><b>reference2.</b></p><p><b>reference1.1.</b></p><p>http://ehelse.no/Endpoint/0</p><p><b>reference2.1.</b></p><p><b>invalid XML1.1. Header: &lt;xml&gt; er &quot;tull&quot; og &apos;tøys&apos;!?</b></p><p>&lt;xml&gt; er &quot;Tull&quot; &amp; &apos;tøys&apos;!</p><p><b>open-choice1. Open Choice?</b></p><p></p><p>foo</p><p><b>quantity1. Quantity?</b></p><p></p><p><b>quantity2.</b></p></div>';
    expect(createNarrative(dataModel.refero.form.FormData.Content)).toEqual(expectedResult);
  });
});
