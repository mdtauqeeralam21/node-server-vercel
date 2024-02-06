const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 4000;

app.use(express.json());

// Utility function to read the database file
const readDB = () => {
  return JSON.parse(fs.readFileSync('db.json', 'utf8'));
};

// Utility function to write to the database file
const writeDB = (data) => {
  fs.writeFileSync('db.json', JSON.stringify(data, null, 2), 'utf8');
};

// GET all items from a resource
app.get('/api/:resource', (req, res) => {
  const { resource } = req.params;
  const data = readDB();
  res.json(data[resource] || []);
});

// GET a single item by ID from a resource
app.get('/api/:resource/:id', (req, res) => {
  const { resource, id } = req.params;
  const data = readDB();
  const itemId = parseInt(id, 10); // Assuming IDs are integers
  const item = data[resource] ? data[resource].find(item => item.id === itemId) : null;

  if (item) {
    res.json(item);
  } else {
    res.status(404).send('Item not found');
  }
});

// POST a new item to a resource with auto-generated ID
    app.post('/api/:resource', (req, res) => {
    const { resource } = req.params;
    const newItem = req.body;
    const data = readDB();
  
    if (!data[resource]) {
      data[resource] = [];
    }
  
    // Generate a new ID
    const newId = data[resource].length > 0 ? Math.max(...data[resource].map(item => item.id)) + 1 : 1;
    newItem.id = newId; // Assign the new ID to the newItem object
  
    data[resource].push(newItem);
    writeDB(data);
    res.status(201).send(newItem);
  });

// app.post('/api/:resource', (req, res) => {
//   const { resource } = req.params;
//   const newItem = req.body;
//   const data = readDB();

//   if (!data[resource]) {
//     data[resource] = [];
//   }

//   data[resource].push(newItem);
//   writeDB(data);
//   res.status(201).send(newItem);
// });

// PUT (update) an item in a resource

app.put('/api/:resource/:id', (req, res) => {
    const { resource, id } = req.params;
    const updateData = req.body;
    const data = readDB();
    const itemId = parseInt(id, 10); // Assuming IDs are integers
  
    if (data[resource]) {
      const index = data[resource].findIndex(item => item.id === itemId);
      if (index > -1) {
        // Merge existing item data with updateData, preserving any fields not explicitly updated
        data[resource][index] = { ...data[resource][index], ...updateData };
        writeDB(data);
        res.send(data[resource][index]);
      } else {
        res.status(404).send('Item not found');
      }
    } else {
      res.status(404).send('Resource not found');
    }
  });



// app.put('/api/:resource/:id', (req, res) => {
//   const { resource, id } = req.params;
//   const updateData = req.body;
//   const data = readDB();
//   const itemId = parseInt(id, 10);

//   if (data[resource]) {
//     const index = data[resource].findIndex(item => item.id === itemId);
//     if (index > -1) {
//       data[resource][index] = updateData;
//       writeDB(data);
//       res.send(updateData);
//     } else {
//       res.status(404).send('Item not found');
//     }
//   } else {
//     res.status(404).send('Resource not found');
//   }
// });

// DELETE an item from a resource
app.delete('/api/:resource/:id', (req, res) => {
  const { resource, id } = req.params;
  const data = readDB();
  const itemId = parseInt(id, 10);

  if (data[resource]) {
    const index = data[resource].findIndex(item => item.id === itemId);
    if (index > -1) {
      data[resource].splice(index, 1);
      writeDB(data);
      res.status(204).send();
    } else {
      res.status(404).send('Item not found');
    }
  } else {
    res.status(404).send('Resource not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});