import { o } from "./lib/index-v2.js";

/*
<button class="font-bold bg-indigo-600 text-indigo-50 hover:bg-indigo-500 py-1 px-3 text-sm rounded-sm">Small</button>
<button class="font-bold bg-indigo-600 text-indigo-50 hover:bg-indigo-500 py-2 px-4 text-base rounded-md">Medium</button>
<button class="font-bold bg-indigo-600 text-indigo-50 hover:bg-indigo-500 py-4 px-8 text-lg rounded-lg">Large</button>
<button class="font-bold bg-indigo-600/50 text-indigo-50 py-2 px-4 text-sm rounded-sm cursor-auto">Disabled</button>
<button class="font-bold bg-orange-600 text-orange-50 hover:bg-orange-500 py-2 px-4 text-sm rounded-sm">Orange</button>
*/

// function getClasses({
//   sm = false,
//   lg = false,
//   disabled = false,
//   orange = false,
// }) {
//   const classes = ["font-bold"];

//   if (sm) {
//     classes.push("text-sm", "py-1", "px-3", "rounded-sm");
//   } else if (lg) {
//     classes.push("text-lg", "py-4", "px-8", "rounded-lg");
//   } else {
//     classes.push("text-base", "py-2", "px-4", "rounded-md");
//   }

//   if (disabled) {
//     classes.push("cursor-auto");
//   }

//   if (orange) {
//     if (disabled) {
//       classes.push("bg-orange-600/50", "text-orange-50");
//     } else {
//       classes.push("bg-orange-600", "text-orange-50", "hover:bg-orange-500");
//     }
//   } else {
//     if (disabled) {
//       classes.push("bg-indigo-600/50", "text-indigo-50");
//     } else {
//       classes.push("bg-indigo-600", "text-indigo-50", "hover:bg-indigo-500");
//     }
//   }

//   return classes.join(" ");
// }

// let expected =
//   "font-bold text-lg py-4 px-8 rounded-lg cursor-auto bg-orange-600/50 text-orange-50";
// let classes = getClasses({
//   lg: true,
//   disabled: true,
//   orange: true,
// });
// console.log(expected === classes ? "✅" : "❌", classes);

// expected =
//   "font-bold text-sm py-1 px-2 rounded-sm bg-indigo-600/50 text-indigo-50";
// classes = getClasses({
//   sm: true,
// });
// console.log(expected === classes ? "✅" : "❌", classes);

let style = o
  .base("font-bold")
  .variants([
    {
      sm: "py-1 px-2 text-sm rounded-sm",
      md: "py-2 px-4 text-base rounded-md",
      lg: "px-8 py-4 text-lg rounded-lg",
    },
    {
      disabled: "cursor-auto",
    },
    {
      indigo: "bg-indigo-600 text-indigo-50 hover:bg-indigo-500",
      orange: "bg-orange-600 text-orange-50 hover:bg-orange-500",
      "indigo disabled": "bg-indigo-600/50 text-indigo-50",
      "orange disabled": "bg-orange-600/50 text-orange-50",
    },
  ])
  .defaults("md indigo");

let expected =
  "font-bold py-2 px-4 text-base rounded-md cursor-auto bg-indigo-600/50 text-indigo-50";
let classes = style.pick("disabled");
console.log(expected === classes ? "✅" : "❌");
console.log(expected);
console.log(classes);
