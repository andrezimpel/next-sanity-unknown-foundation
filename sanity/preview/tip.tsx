import { PreviewProps } from "sanity"

export default function TipPreview(props: PreviewProps) {
  console.log({ props })

  return (
    <div className="bg-muted p-4 rounded-lg">
      <div>{props.children}</div>
    </div>
  )
}