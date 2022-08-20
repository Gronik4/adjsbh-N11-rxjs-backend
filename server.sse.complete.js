const { faker } = require('@faker-js/faker');
const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const  koaCors  = require('koa-cors');
const { v4 } = require('uuid');
const { streamEvents} = require('http-event-stream');

const app = new Koa;
const router = new Router();

let data = {};
app.use(koaBody());
app.use(koaCors());

router.get('/sse', async (cxt) => {
  streamEvents(cxt.req, cxt.res, {
    async fetch() {
      return [];
    },
    stream(sse) {
      const intervalMes = setInterval(() => {
        const name = faker.name.firstName();
        const surName = faker.name.lastName();
        data.status = 'ok';
        data.timestamp = Date.now();
        data.message = [{
          id: v4(),
          from: `${name}@${surName}`,
          subject: `Hello from ${name}`,
          body: `Some long long message from ${name}`,
          received: Date.now()
        }]
        sse.sendEvent({
          data: JSON.stringify(data),
        })
      }, 5000);
      return () => clearInterval(intervalMes);
    }
  })
  cxt.response.status = 201;
  // Строка ниже говорит коа - не надо обрабатывать, сам обработаю..
  cxt.respond = false;
});
app.use(router.routes()).use(router.allowedMethods());

const port = 8090;
http.createServer(app.callback()).listen(port);
