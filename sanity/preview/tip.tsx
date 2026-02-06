import { BlockStyleProps } from "sanity"

export default function TipPreview(props: BlockStyleProps) {
  return (
    <div className="bg-muted p-4 rounded-lg">
      <div>{props.children}</div>
    </div>
  )
}