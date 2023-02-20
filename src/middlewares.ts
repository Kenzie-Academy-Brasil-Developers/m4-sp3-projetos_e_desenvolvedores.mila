import { Request, Response, NextFunction } from "express";
import { QueryConfig } from "pg";
import { client } from "./database";
import { iDevelopersResult } from "./interface";

const ensureDevsExists = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const id: Number = parseInt(request.params.id);

  const queryString: string = `
  SELECT
		*
	FROM 
		developers
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

  return next();
};

export { ensureDevsExists };
