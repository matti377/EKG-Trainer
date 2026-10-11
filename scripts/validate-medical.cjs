const content = require("../assets/js/sono/content.js");
const { validate } = require("../assets/js/sono/core.js");
const publication = process.argv.includes("--publication");
const quiz = require("../assets/js/academy/quiz.js").load(
  require("node:fs").readFileSync(
    require("node:path").join(__dirname, "../assets/data/fragen.csv"),
    "utf8",
  ),
);
const errors = validate(content, publication).concat(
  quiz.errors.map((e) => "fragen.csv: " + e),
);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Medical schema OK: ${content.lessons.length} lessons, ${content.quizzes.length} quizzes, ${content.cases.length} cases, ${quiz.questions.length} quiz questions. Content awaits expert review; schema checks do not certify medical accuracy.`,
  );
