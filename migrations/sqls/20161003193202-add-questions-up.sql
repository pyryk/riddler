/* Replace with your SQL commands */
CREATE TABLE questions (
    "id" serial NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"creator" text NOT NULL references users(username),
	PRIMARY KEY ("id")
);
