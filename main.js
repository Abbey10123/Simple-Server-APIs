const http = require("http");
const fs = require("fs");
const path = require("path");
const { it } = require("node:test");

const itemsDbPaths = path.join(__dirname, "database", "items.json");
const htmlPath = path.join(__dirname, "html", "index.html" );

let itemsDb = [];

const hostname = "localhost";
const port = 5000;


const requestHandler = function (req, res) {
  if (req.url === "/index.html" || req.url === "/" && req.method === "GET"){
    homePage(req, res)}
  else if (req.url === "/random.html" && req.method === "GET"){
    errorPage(req, res)
  } 
  else if (req.url === "/students" && req.method === "GET") {
    getAllItems(req, res);
  }
  else if (req.url === "/students/id" && req.method === "GET") {
    getById(req, res);
  } else if (req.url === "/students" && req.method === "POST") {
    createItem(req, res);
  } else if (req.url === "/students" && req.method === "PATCH") {
    updateItem(req, res);
  } else if (req.url === "/students" && req.method === "DELETE") {
    deleteItem(req, res);
  } else{
    errorPage(req, res)
  }
};



const homePage = function (req, res)  {
  fs.readFile(htmlPath, "utf8", (err, data) => {
      if (err) {
          
          res.writeHead(404);
          return res.end(`<h1>404 - File Not Found</h1><p>The page you're looking for doesn't exist.</p>`);
      }
      res.writeHead(200);
      res.end(data);
  });
};

const errorPage = function (req, res){
        res.writeHead(404);
        return res.end(`<h1>404 - File Not Found</h1><p>The page you're looking for doesn't exist.</p>`);
    }

const getById = function (req, res) {
  const body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const parsedItem = Buffer.concat(body).toString();
    const foundItem = JSON.parse(parsedItem);
    const foundItemId = foundItem.id;
    fs.readFile(itemsDbPaths, "utf8", (err, items) => {
      if (err) {
        console.log(err);
        res.writeHead(400);
        res.end("An error Occured");
      }
      const itemsObj = JSON.parse(items);
      const itemIndex = itemsObj.find((item) => item.id === foundItemId);
      if (itemIndex === -1) {
        res.writeHead("404");
        res.end("item not found");
      }
      const foundIndex = [itemIndex.name, itemIndex.price, itemIndex.size];
      res.writeHead(201);

      res.end(JSON.stringify(foundIndex));
    });
  });
};

const getAllItems = function (req, res) {
  fs.readFile(itemsDbPaths, "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.writeHead(400);
      res.end("An error Occured");
    }
    res.end(data);
  });
};

const updateItem = function (req, res) {
  const body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const parsedItem = Buffer.concat(body).toString();
    const foundItem = JSON.parse(parsedItem);
    const foundItemId = foundItem.id;

    fs.readFile(itemsDbPaths, "utf8", (err, items) => {
      if (err) {
        console.log(err);
        res.writeHead(400);
        res.end("An error Occured");
      }
      const itemsObj = JSON.parse(items);
      const itemIndex = itemsObj.findIndex((item) => item.id === foundItemId);
      if (itemIndex === -1) {
        res.writeHead("404");
        res.end("item not found");
      }
      const itemToUpdate = { ...itemsObj[itemIndex], ...foundItem };
      itemsObj[itemIndex] = itemToUpdate;

      fs.writeFile(itemsDbPaths, JSON.stringify(itemsObj), (err) => {
        if (err) {
          console.log(err);
          res.writeHead(500);
          res.end("An error Occured");
        }
        res.writeHead(201);
        res.end("Update is successful");
      });
    });
  });
};

const createItem = function (req, res) {
  const body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const parsedStud = Buffer.concat(body).toString();
    const newItems = JSON.parse(parsedStud);
    itemsDb.push(newItems);

    fs.readFile(itemsDbPaths, "utf8", (err, data) => {
      if (err) {
        console.log(err);
        res.writeHead(400);
        res.end("An error Occured");
      }
      const oldItems = JSON.parse(data);
      const allItems = [...oldItems, newItems];
      fs.writeFile(itemsDbPaths, JSON.stringify(allItems), (err) => {
        if (err) {
          console.log(err);
          res.writeHead(500);
          res.end("An error Occured");
        }
        res.end(JSON.stringify(allItems));
      });
    });
  });
};

const deleteItem = function (req, res){
    const body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const parsedItem = Buffer.concat(body).toString();
    const foundItem = JSON.parse(parsedItem);
    const foundItemId = foundItem.id;
    fs.readFile(itemsDbPaths, "utf8", (err, items) => {
        if (err) {
          console.log(err);
          res.writeHead(400);
          res.end("An error Occured");
        }
        const itemsObj = JSON.parse(items);

        const itemIndex = itemsObj.findIndex((item) => item.id === foundItemId);

        if (itemIndex === -1) {
          res.writeHead(404);
          res.end("item not found")
          return;
        };

        itemsObj.splice(itemIndex, 1);

        fs.writeFile(itemsDbPaths, JSON.stringify(itemsObj), (err) => {
            if (err) {
              console.log(err);
              res.writeHead(500)
              res.end("An error Occured");
            }

            res.writeHead(201);
            return res.end("Deletion is successful");
          });
    })
   
      });




}



const server = http.createServer(requestHandler);
server.listen(port, hostname, () => {
  console.log(`Server is running at http://${hostname}:${port}`);
});
