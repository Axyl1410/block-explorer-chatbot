export const gridBackground = () => {
  return (
    <div className="relative h-1/2 w-full">
      <div
        className="absolute top-0 right-0 left-1/2 hidden h-[1px] w-[calc(100%+200px)] -translate-x-1/2 -translate-y-5 lg:block"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--active-border) 0 30%, transparent 0 100%)",
          backgroundRepeat: "repeat",
          backgroundSize: "10px 10px",
          maskImage:
            "linear-gradient(to right, rgba(0, 0, 0, 0.1), black 20%, black 80%, rgba(0, 0, 0, 0.1))",
        }}
      />
      <div
        className="absolute right-0 bottom-0 left-1/2 hidden h-[1px] w-[calc(100%+200px)] -translate-x-1/2 translate-y-5 lg:block"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--active-border) 0 30%, transparent 0 100%)",
          backgroundRepeat: "repeat",
          backgroundSize: "10px 10px",
          maskImage:
            "linear-gradient(to right, rgba(0, 0, 0, 0.1), black 20%, black 80%, rgba(0, 0, 0, 0.1))",
        }}
      />
      <div
        className="absolute top-1/2 left-8 hidden h-[calc(100%+200px)] w-[1px] -translate-y-1/2 lg:block"
        style={{
          backgroundImage:
            "linear-gradient(180deg, var(--active-border) 0 30%, transparent 0 100%)",
          backgroundRepeat: "repeat",
          backgroundSize: "10px 10px",
          maskImage:
            "linear-gradient(rgba(0, 0, 0, 0.1), black 20%, black 80%, rgba(0, 0, 0, 0.1))",
        }}
      />
      <div
        className="absolute top-1/2 right-8 hidden h-[calc(100%+200px)] w-[1px] -translate-y-1/2 lg:block"
        style={{
          backgroundImage:
            "linear-gradient(180deg, var(--active-border) 0 30%, transparent 0 100%)",
          backgroundRepeat: "repeat",
          backgroundSize: "10px 10px",
          maskImage:
            "linear-gradient(rgba(0, 0, 0, 0.1), black 20%, black 80%, rgba(0, 0, 0, 0.1))",
        }}
      />
    </div>
  );
};
