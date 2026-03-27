export const Correction = ({ wrong, correct }: { wrong: string; correct: string }) => (
  <span className="space-x-1">
    <del
      className="hover:h-unset focus-visible:h-unset relative -mb-1 inline-block h-5 w-1.5 overflow-hidden rounded bg-red-400/20 text-transparent transition-[width,padding] duration-500 hover:inline hover:w-auto hover:px-1 hover:text-red-400 focus-visible:inline focus-visible:w-auto focus-visible:px-1 focus-visible:text-red-400 dark:hover:text-red-300 dark:focus-visible:text-red-300"
      tabIndex={0}
      aria-label={`wrong: ${wrong}`}
      title={wrong}
    >
      {wrong}
    </del>
    <ins className="text-foreground-primary rounded bg-green-300/40 px-1.5 no-underline dark:bg-green-800/80">
      {correct}
    </ins>
  </span>
);
