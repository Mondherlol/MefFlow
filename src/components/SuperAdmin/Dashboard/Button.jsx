const tokens = {
  brandGrad: "bg-gradient-to-r from-sky-600 to-sky-400",
  orangeBtn: "bg-orange-500 hover:bg-orange-600 text-white",
  ghostBtn:
    "bg-transparent text-sky-800 hover:bg-sky-50 hover:text-sky-900 underline decoration-orange-300/80 underline-offset-4",
};

function Button({ children, variant = "primary", className = "", ...rest }) {
  const variants = {
    primary: `${tokens.brandGrad} text-white hover:from-sky-500 hover:to-indigo-500`,
    outline:
      "border border-slate-300 bg-white hover:bg-slate-50 text-slate-800",
    ghost: tokens.ghostBtn,
    orange: tokens.orangeBtn,
    subtle: "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200",
    icon:
      "h-9 w-9 grid place-items-center rounded-lg border border-slate-200 bg-white hover:bg-sky-50 text-slate-700",
  };
  return (
    <button
      className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}


export default Button;