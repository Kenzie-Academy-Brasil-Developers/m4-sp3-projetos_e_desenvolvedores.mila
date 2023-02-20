CREATE TYPE preferredOS AS ENUM ('Windows', 'MacOS', 'Linux'); 

CREATE  TABLE IF NOT EXISTS developer_infos(
	"developerInfoid" SERIAL PRIMARY KEY,
	"developerSince" DATE NOT NULL,
	"preferredOS" preferredOS NOT NULL
)

SELECT * FROM developer_infos

CREATE TABLE IF NOT EXISTS developers(
	id SERIAL PRIMARY KEY ,
	name VARCHAR(50) NOT NULL ,
	email VARCHAR(50) NOT NULL, 
	"developerInfoId" INTEGER UNIQUE,
	FOREIGN KEY ("developerInfoId") REFERENCES developer_infos("developerInfoid")
	ON DELETE CASCADE 
)

SELECT *
FROM developers
FULL OUTER JOIN developer_infos
	ON developers."developerInfoId" = developer_infos."developerInfoid";
	
UPDATE
        developers 
      SET 
        developerInfoId = 5
      WHERE
        id = 4
      RETURNING *;

CREATE TABLE IF NOT EXISTS projects(
	id SERIAL PRIMARY KEY NOT NULL,
	name VARCHAR(50) NOT NULL,
	description TEXT NOT NULL,
	"estimatedTime" VARCHAR(20) NOT NULL,
	repository VARCHAR(120) NOT NULL,
	"startDate" DATE NOT NULL,
	"endDate" DATE,
	"developerId" INTEGER UNIQUE,
	FOREIGN KEY ("developerId") REFERENCES developers(id)
)

ALTER TABLE projects 
RENAME COLUMN id TO "projectsId";

SELECT * FROM projects

CREATE TABLE IF NOT EXISTS technologies(
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(30) NOT NULL
);

INSERT INTO 
	technologies ("tech") 
VALUES 
	('JavaScript'), ('Python'), ('React'), ('Express.js'), ('HTML'), ('CSS'), ('Django'), ('PostgreSQL'),('MongoDB'); 

CREATE TABLE IF NOT EXISTS projects_technologies(
	"idProjectTech" SERIAL PRIMARY KEY,
	"addedIn" DATE NOT NULL,
	"projectId" INTEGER NOT NULL,
	"technologyId" INTEGER NOT NULL,
	FOREIGN KEY ("projectId") REFERENCES projects("projectsId"),
	FOREIGN KEY ("technologyId") REFERENCES technologies(id)
)

SELECT * FROM projects_technologies