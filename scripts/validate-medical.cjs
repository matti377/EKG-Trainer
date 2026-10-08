const content = require("../assets/js/sono/content.js");
const { validate } = require("../assets/js/sono/core.js");
const publication = process.argv.includes("--publication");
const errors = validate(content, publication);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Medical schema OK: ${content.lessons.length} lessons, ${content.quizzes.length} quizzes, ${content.cases.length} cases. Content awaits expert review; schema checks do not certify medical accuracy.`,
  );
