import TestPageComponentAll from "./component-all"
import TestPageComponentSeperate from "./component-seperate"

export default async function TestPage() {
  return (
    <div>
      <TestPageComponentAll />
      <hr />
      <TestPageComponentSeperate />
    </div>
  )
}
