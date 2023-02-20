import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "./database";
import {
  iDevelopers,
  iDevelopersInfo,
  iDevelopersInfoExt,
  iDevelopersInfoResult,
  iDevelopersResult,
  iProjects,
  iProjectsExt,
  iProjectsResult,
  iTechnologies,
  iTechnologiesResult,
  iTechProjectsResult,
} from "./interface";

//--------------------POST---------------------//
export const createDev = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const devListData: iDevelopers = request.body;
    const { name, email } = {
      ...devListData,
    };

    const queryEmail: string = `
    SELECT 
        *
    FROM 
        developers
    WHERE
        email = $1
    `;
    const queryEmailConfig: QueryConfig = {
      text: queryEmail,
      values: Object.values([email]),
    };

    const queryEmailResult: iDevelopersResult = await client.query(
      queryEmailConfig
    );

    if (queryEmailResult.rows.length > 0) {
      return response.status(409).json({
        message: "Email already exists.",
      });
    }

    const queryString: string = `
    INSERT INTO
        developers (name, email)
    VALUES 
        ($1, $2)
    RETURNING *
    `;
    const queryConfig: QueryConfig = {
      text: queryString,
      values: Object.values({ name, email }),
    };

    const queryResult: iDevelopersResult = await client.query(queryConfig);
    const newDevelopers: iDevelopers = queryResult.rows[0];
    return response.status(201).json(newDevelopers);
  } catch (error) {
    console.log(error);
    return response.status(400).json({
      message: "Missing required keys",
    });
  }
};

//--------------------GET----------------------//
export const getDevelopersInfoList = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const queryString: string = `
  SELECT *
    FROM developers
    FULL OUTER JOIN developer_infos
	    ON developers."developerInfoId" = developer_infos."developerInfoid"  
  `;

  const queryResult: iDevelopersResult = await client.query(queryString);
  return response.status(201).json(queryResult.rows);
};

//--------------------GET BY ID----------------------//
export const getDevelopersInfoListById = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);
  const queryString: string = `
    SELECT
          *
        FROM 
            developers
        FULL OUTER JOIN developer_infos
	    ON developers."developerInfoId" = developer_infos."developerInfoid" 
    WHERE
        id = $1;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  const queryResult: iDevelopersResult = await client.query(queryConfig);
  if (!queryResult.rowCount) {
    return response.status(404).json({
      message: "Developer not found",
    });
  }

  return response.json(queryResult.rows[0]);
};

//-----------------POST BY ID + INFO---------------//
export const createDevInfoById = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const id: number = parseInt(request.params.id);
    const devListData: iDevelopersInfo = request.body;
    console.log(devListData);
    if (
      devListData.developerSince === undefined ||
      devListData.preferredOS === undefined
    ) {
      return response.status(400).json({
        message: "developerSince,preferredOS.",
      });
    }
    const developersData = {
      ...devListData,
    };
    //-----------------------------------------------
    const queryInfo: string = `
    SELECT 
        *
    FROM 
        developers
    WHERE
        id = $1
    `;
    const queryInfoConfig: QueryConfig = {
      text: queryInfo,
      values: Object.values([id]),
    };

    const queryInfosResult: iDevelopersResult = await client.query(
      queryInfoConfig
    );

    if (queryInfosResult.rows[0].developerInfoId !== null) {
      return response.status(409).json({
        message: "Info already exists.",
      });
    }

    //------------------------------

    const queryString: string = `
      INSERT INTO
        developer_infos ("developerSince", "preferredOS")
      VALUES 
          ($1, $2)
      RETURNING *
      `;
    console.log(devListData);
    const queryConfig: QueryConfig = {
      text: queryString,
      values: Object.values([
        developersData.developerSince,
        developersData.preferredOS,
      ]),
    };

    const queryResult: iDevelopersInfoResult = await client.query(queryConfig);
    const newDevelopersInfo: iDevelopersInfoExt = queryResult.rows[0];

    const queryStringDevInfo: string = `
      UPDATE
        developers 
      SET 
        "developerInfoId" = $1
      WHERE
        id = $2
      RETURNING *
      `;

    const queryConfigInfo: QueryConfig = {
      text: queryStringDevInfo,
      values: [newDevelopersInfo.developerInfoid, id],
    };

    const queryInfoResult: iDevelopersResult = await client.query(
      queryConfigInfo
    );
    const updatedInfo: iDevelopers = queryInfoResult.rows[0];

    if (!queryInfoResult.rowCount) {
      return response.status(404).json({
        message: "Developer not found",
      });
    }

    return response.status(201).json(updatedInfo);
  } catch (error) {
    console.log(error);
    return response.status(404).json({
      message: "Developer not found",
    });
  }
};

//-----------------PATCH ID------------------//
export const updateDevById = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const id: number = parseInt(request.params.id);
    const devListPatch: iDevelopers = request.body;
    const { email, name } = {
      ...devListPatch,
    };

    const developerKeys = Object.keys({ email, name });
    const developerData = Object.values({ email, name });
    const queryEmail: string = `
    SELECT 
        *
    FROM 
        developers
    WHERE
        email = $1
    `;
    const queryEmailConfig: QueryConfig = {
      text: queryEmail,
      values: Object.values([email]),
    };

    const queryEmailResult: iDevelopersResult = await client.query(
      queryEmailConfig
    );

    console.log(queryEmailConfig);
    if (queryEmailResult.rows.length > 0) {
      return response.status(409).json({
        message: "Email already exists.",
      });
    }

    const queryString: string = format(
      `
    UPDATE 
        developers
    SET(%I) = ROW(%L)
    WHERE
        id = $1
    RETURNING *;
    `,
      developerKeys,
      developerData
    );

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    };
    const queryResult: iDevelopersResult = await client.query(queryConfig);

    if (!queryResult.rowCount) {
      return response.status(404).json({
        message: "Developer not found",
      });
    }

    return response.json(queryResult.rows[0]);
  } catch (error) {
    console.log(error);
    return response.status(400).json({
      message: "Missing required keys",
    });
  }
};

//-----------------PATCH ID INFO-------------------//
export const updateDevInfoById = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const id: number = parseInt(request.params.id);
    const { developerSince, preferredOS }: iDevelopersInfo = request.body;
    const developerKeys = Object.keys({ developerSince, preferredOS });
    const developerData = Object.values({ developerSince, preferredOS });

    if (!developerSince || !preferredOS) {
      return response.status(400).json({
        message: "At least one of those keys must be send.",
        keys: ["developersince", "preferredos"],
      });
    }
    //-----------------------------------------------
    const queryInfo: string = `
    SELECT 
        *
    FROM 
        developers
    WHERE
        id = $1
    `;
    const queryInfoConfig: QueryConfig = {
      text: queryInfo,
      values: Object.values([id]),
    };

    const queryInfosResult: iDevelopersResult = await client.query(
      queryInfoConfig
    );

    //------------------------------
    const queryString: string = format(
      `
            UPDATE 
                developer_infos
            SET(%I) = ROW(%L)
            WHERE
              "developerInfoid" = $1
            RETURNING *;
            `,
      developerKeys,
      developerData
    );

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [queryInfosResult.rows[0].developerInfoId],
    };
    const queryResult: iDevelopersResult = await client.query(queryConfig);

    console.log(queryResult);
    if (!queryResult.rowCount) {
      return response.status(404).json({
        message: "info not found",
      });
    }

    return response.json(queryResult.rows[0]);
  } catch (error) {
    return response.json({
      message: "Developer not found",
    });
  }
};

//----------------------DELETE-----------------------//
export const deleteDeveloperList = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: string = request.params.id;
  const queryString: string = `
    DELETE FROM 
          developers
    WHERE
      id = $1
    RETURNING *;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  const queryResult: iDevelopersResult = await client.query(queryConfig);
  if (!queryResult.rowCount) {
    return response.status(404).json({
      message: "Developer not found",
    });
  }

  return response.status(204).send();
};

//------------------POST PROJECTS-----------------//
export const createProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const projectsListData: iProjects = request.body;
    const {
      name,
      description,
      estimatedTime,
      repository,
      startDate,
      developerId,
    } = {
      ...projectsListData,
    };

    if (
      name === undefined ||
      description === undefined ||
      estimatedTime === undefined ||
      repository === undefined ||
      startDate === undefined ||
      developerId === undefined
    ) {
      return response.status(400).json({
        message: "Missing required keys",
      });
    }

    const projectKeys = Object.keys({
      name,
      description,
      estimatedTime,
      repository,
      startDate,
      developerId,
    });
    const projectData = Object.values({
      name,
      description,
      estimatedTime,
      repository,
      startDate,
      developerId,
    });

    //-----------------------------------------------
    const queryInfo: string = `
    SELECT 
        *
    FROM 
        developers
    WHERE
        id = $1
    `;
    const queryInfoConfig: QueryConfig = {
      text: queryInfo,
      values: Object.values([developerId]),
    };

    const queryInfosResult: iDevelopersResult = await client.query(
      queryInfoConfig
    );

    if (queryInfosResult.rowCount === 0) {
      return response.status(404).json({
        message: "Developer not found",
      });
    }

    //-----------------------------------------------

    const queryString: string = format(
      `
      INSERT INTO
          projects (%I)
      VALUES 
          (%L)
      RETURNING *
      `,
      projectKeys,
      projectData
    );

    const queryResult: iProjectsResult = await client.query(queryString);
    const newProject: iProjectsExt = queryResult.rows[0];
    if (!queryResult.rowCount) {
      return response.status(404).json({
        message: "Developer not found",
      });
    }
    return response.status(201).json(newProject);
  } catch (error) {
    console.log(error);
    return response.status(400).json({
      message: "Missing required keys",
    });
  }
};

//------------------GET PROJECTS-----------------//
export const getProjectsTechList = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const queryString: string = `
    SELECT *
      FROM projects
      FULL OUTER JOIN projects_technologies
          ON projects."projectsId" = projects_technologies."projectId"
    `;

  const queryResult: iTechProjectsResult = await client.query(queryString);
  return response.status(201).json(queryResult.rows);
};

//------------------GET PROJECTS BY ID-----------------//
export const getProjectsTechListById = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);
  const queryString: string = `
      SELECT
            *
      FROM projects
      FULL OUTER JOIN projects_technologies
          ON projects.id = projects_technologies."projectId"
      WHERE
          id = $1;
      `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  const queryResult: iProjectsResult = await client.query(queryConfig);
  if (!queryResult.rowCount) {
    return response.status(404).json({
      message: "Project not found",
    });
  }

  return response.json(queryResult.rows[0]);
};

//-----------------PATCH PROJECTS ID------------------//
export const updateProjectsById = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const id: number = parseInt(request.params.id);
    const {
      name,
      description,
      estimatedTime,
      repository,
      startDate,
      endDate,
      developerId,
    }: iProjects = request.body;
    const developerKeys = Object.keys({
      name,
      description,
      estimatedTime,
      repository,
      startDate,
      endDate,
      developerId,
    });
    const developerData = Object.values({
      name,
      description,
      estimatedTime,
      repository,
      startDate,
      endDate,
      developerId,
    });

    const queryString: string = format(
      `
      UPDATE 
          projects
      SET(%I) = ROW(%L)
      WHERE
      "projectsId" = $1
      RETURNING *;
      `,
      developerKeys,
      developerData
    );

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    };
    const queryResult: iProjectsResult = await client.query(queryConfig);

    if (!queryResult.rowCount) {
      return response.status(404).json({
        message: "Project not found",
      });
    }

    return response.json(queryResult.rows[0]);
  } catch {
    return response.status(400).json({
      message: "Missing required keys",
    });
  }
};

//----------------------DELETE PROJECT-----------------------//
export const deleteProjectList = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: string = request.params.id;
  const queryString: string = `
      DELETE FROM 
            projects
      WHERE
        id = $1
      RETURNING *;
      `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  const queryResult: iProjectsResult = await client.query(queryConfig);
  if (!queryResult.rowCount) {
    return response.status(404).json({
      message: "Projects not found",
    });
  }

  return response.status(204).send();
};

//----------------------POST TECH PROJECT-----------------------//
export const creteTechProjectList = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const { name } = request.body;
    const projectId: number = parseInt(request.params.id);

    const queryStringTech: string = `
        SELECT *
        FROM technologies
        WHERE tech = $1
    `;

    const queryConfigTech: QueryConfig = {
      text: queryStringTech,
      values: Object.values([name]),
    };

    const queryResultTech: iTechnologiesResult = await client.query(
      queryConfigTech
    );
    const techInfo: iTechnologies = queryResultTech.rows[0];
    console.log(techInfo);

    const queryString: string = `
          INSERT INTO
            projects_technologies ("addedIn", "projectId", "technologyId")
          VALUES 
              ($1, $2, $3)
          RETURNING *
          `;

    const queryConfig: QueryConfig = {
      text: queryString,
      values: Object.values(["2022-12-12", projectId, techInfo.id]),
    };

    const queryResult: iProjectsResult = await client.query(queryConfig);

    const queryStringProject: string = `
      SELECT
        *
      FROM projects
      FULL OUTER JOIN projects_technologies
          ON projects."projectsId" = projects_technologies."projectId"
      WHERE
      "projectsId" = $1;
      `;

    const queryConfigProject: QueryConfig = {
      text: queryStringProject,
      values: [projectId],
    };
    const queryResultProject: iProjectsResult = await client.query(
      queryConfigProject
    );

    return response.json(queryResultProject.rows[0]);
  } catch (error) {
    console.log(error);
    return response.status(404).json({
      message: "Technology not found",
    });
  }
};

//----------------------DELETE PROJECT TECH-----------------------//
export const deleteProjectTech = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: string = request.params.id;
  const name: string = request.params.name;

  const queryStringTech: string = `
        SELECT *
        FROM technologies
        WHERE tech = $1
    `;

  const queryConfigTech: QueryConfig = {
    text: queryStringTech,
    values: Object.values([name]),
  };

  const queryResultTech: iTechnologiesResult = await client.query(
    queryConfigTech
  );
  const techInfo: iTechnologies = queryResultTech.rows[0];

  const queryString: string = `
        DELETE FROM 
            projects_technologies
        WHERE
         "projectId" = $1 AND "technologyId" = $2
        RETURNING *;
        `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id, techInfo.id],
  };
  const queryResult: iProjectsResult = await client.query(queryConfig);
  if (!queryResult.rowCount) {
    return response.status(404).json({
      message: "Project technology not found",
    });
  }

  return response.status(204).send();
};
