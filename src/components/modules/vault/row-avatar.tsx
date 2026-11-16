/** The row avatar: 42 px, radius 14, muted fill, the first letter of the title. */
export function RowAvatar({ title }: { title: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-10.5 shrink-0 items-center justify-center rounded-[0.875rem] bg-muted text-base font-bold"
    >
      {title.charAt(0).toUpperCase()}
    </span>
  );
}
