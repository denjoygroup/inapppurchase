export default interface IConstants {
  port: number;
  postgres: {
    host: string,
    port: number,
    username: string,
    password: string,
    database: string,

    ca?: string,
    key?: string,
    cert?: string
  };
  redis: {
    host: string,
    port: number
  };

  apple: {
    password: string,
    host: string,
    sandbox: string,
    path: string,
    apiHost: string,
    pathToCheckSales: string
  };
  google: {
    host: string,
    path: string,
    email: string,
    key: string,
    storeName: string
  };
  [key: string]: any;
}
