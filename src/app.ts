import express, { Application } from "express";
import { Request, Response } from "express";
import { startDatabase } from "./database";
import {
  createDev,
  createDevInfoById,
  createProject,
  creteTechProjectList,
  deleteDeveloperList,
  deleteProjectList,
  deleteProjectTech,
  getDevelopersInfoList,
  getDevelopersInfoListById,
  getProjectsTechList,
  getProjectsTechListById,
  updateDevById,
  updateDevInfoById,
  updateProjectsById,
} from "./functions";

const app: Application = express();
app.use(express.json());

app.post("/developers", createDev);
app.post("/developers/:id/infos", createDevInfoById);
app.get("/developers", getDevelopersInfoList);
app.get("/developers/:id", getDevelopersInfoListById);
app.patch("/developers/:id", updateDevById);
app.patch("/developers/:id/infos", updateDevInfoById);
app.delete("/developers/:id", deleteDeveloperList);

app.post("/projects", createProject);
app.get("/projects", getProjectsTechList);
app.get("/projects/:id", getProjectsTechListById);
app.patch("/projects/:id", updateProjectsById);
app.delete("/projects/:id", deleteProjectList);
app.post("/projects/:id/technologies", creteTechProjectList);
app.delete("/projects/:id/technologies/:name", deleteProjectTech);

app.listen(3000, async () => {
  await startDatabase();
  console.log("Server is running!");
});
