import "reflect-metadata";
import bodyParser from "body-parser";
import { InversifyExpressServer } from "inversify-express-utils";
import { AllParams } from "./app/config/middlewares/AllParams";
import { ExtendResponse } from "./app/config/middlewares/ExtendResponse";
import purchaseControllerFactory from "./app/controllers/PurchaseController";
import IConstants from './constants/interfaces/IConstants';
import Types from './constants/Types';
import container from './inversify.config';
import IHandlerService from "./services/interfaces/IHandlerService";

const constants = container.get<IConstants>(Types.Constants);
const handlerService = container.get<IHandlerService>(Types.HandlerService);
const extendResponse = container.get<ExtendResponse>(Types.ExtendResponse);


(async () => {
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  purchaseControllerFactory(container);
  const server = new InversifyExpressServer(container);
  server.setConfig((app) => {

    let allParams = new AllParams(handlerService, constants);
    let extendResponseConfiguration = extendResponse.configuration.bind(extendResponse);
    let allParamsConfiguration = allParams.configuration.bind(allParams);
    app.use((req, res, next) => {
      console.log(req.path);
      next();
    })
    app.use(extendResponseConfiguration);
    app.use(bodyParser.json({limit: '2mb'}))
    app.use(bodyParser.urlencoded({
      extended: true,
      limit: '2mb'
    }));
    app.use(allParamsConfiguration);
  });

  let app = server.build();
  app.use('*', (req, res) => {
    res.status(404).send({error: 'not found path'});
  });
  
  app.listen(constants.port, async () => {
    console.log(`Server running on port ${constants.port}`);
  });

})();
