import { QueryResult } from "pg";

interface iDevelopers {
  name: string;
  email: string;
  developerInfoId: number;
}

interface iDevelopersExt extends iDevelopers {
  id: number;
}

interface iDevelopersInfo {
  developerSince: string;
  preferredOS: string;
}

interface iDevelopersInfoExt extends iDevelopersInfo {
  developerInfoid: number;
}

interface iProjects {
  name: string;
  description: string;
  estimatedTime: string;
  repository: string;
  startDate: string;
  endDate: string;
  developerId: number;
}

interface iProjectsExt extends iProjects {
  projectsId: number;
}

interface iTechProjects {
  idProjectTech: number;
  addedIn: string;
}

interface iTechnologies {
  id: number;
  tech: string;
}

type iDevelopersResult = QueryResult<iDevelopers>;
type iDevelopersInfoResult = QueryResult<iDevelopersInfoExt>;
type iProjectsResult = QueryResult<iProjectsExt>;
type iTechProjectsResult = QueryResult<iTechProjects>;
type iTechnologiesResult = QueryResult<iTechnologies>;

export {
  iDevelopers,
  iDevelopersExt,
  iDevelopersResult,
  iDevelopersInfo,
  iDevelopersInfoExt,
  iDevelopersInfoResult,
  iProjects,
  iProjectsExt,
  iProjectsResult,
  iTechProjectsResult,
  iTechnologies,
  iTechnologiesResult,
};
