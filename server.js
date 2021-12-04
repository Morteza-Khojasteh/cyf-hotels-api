const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());

const PORT = process.env.PORT || 3000;

const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "cyf_hotels",
  password: "14536",
  port: 5432,
});
app.get("/", (req, res) => {
  res.json("welcome to the server");
});

app.get("/bookings", (req, res) => {
  pool.query("SELECT * FROM bookings", (error, result) => {
    res.json(result.rows);
  });
});

app.get("/hotels", (req, res) => {
  pool.query("SELECT * FROM hotels", (error, result) => {
    res.json(result.rows);
  });
});

app.get("/customers", (req, res) => {
  pool.query("SELECT * FROM customers ORDER BY name", (error, result) => {
    res.json(result.rows);
  });
});

app.post("/hotels", (req, res) => {
  const newHotelName = req.body.name;
  const newHotelRooms = req.body.rooms;
  const newHotelPostcode = req.body.postcode;

  if (!Number.isInteger(newHotelRooms) || newHotelRooms <= 0) {
    return res
      .status(400)
      .send("The number of rooms should be a positive integer.");
  }

  pool
    .query("SELECT * FROM hotels WHERE name=$1", [newHotelName])
    .then((result) => {
      if (result.rows.length > 0) {
        return res
          .status(400)
          .send("An hotel with the same name already exists!");
      } else {
        const query =
          "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)";
        pool
          .query(query, [newHotelName, newHotelRooms, newHotelPostcode])
          .then(() => res.send("Hotel created!"))
          .catch((e) => console.error(e));
      }
    });
});

app.post("/customers", (req, res) => {
  const newCustomersName = req.body.name;
  const newCustomersEmail = req.body.email;
  const newCustomersAddress = req.body.address;
  const newCustomersCity = req.body.city;
  const newCustomersPostcode = req.body.postcode;
  const newCustomersCountry = req.body.country;

  if (
    !newCustomersName ||
    !newCustomersEmail ||
    !newCustomersAddress ||
    !newCustomersCity ||
    !newCustomersPostcode ||
    !newCustomersCountry
  ) {
    return res.status(400).send("Please Complete all filed attributes");
  }

  pool
    .query("SELECT * FROM customers WHERE name=$1 AND address=$2", [
      newCustomersName,
      newCustomersAddress,
    ])
    .then((result) => {
      if (result.rows.length > 0) {
        return res
          .status(400)
          .send("A customer with the same name  and address already exists!");
      } else {
        const query =
          "INSERT INTO customers (name, email, address, city, postcode, country) VALUES ($1, $2, $3, $4, $5, $6)";
        pool
          .query(query, [
            newCustomersName,
            newCustomersEmail,
            newCustomersAddress,
            newCustomersCity,
            newCustomersPostcode,
            newCustomersCountry,
          ])
          .then(() => res.send("Customer created!"))
          .catch((e) => console.error(e));
      }
    });
});

app.get("/hotels/:hotelId", (req, res) => {
  const hotelId = req.params.hotelId;

  pool
    .query("SELECT * FROM hotels WHERE id=$1", [hotelId])
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});

app.get("/customers/:customerId", (req, res) => {
  const customerId = req.params.customerId;

  pool
    .query("SELECT * FROM customers WHERE id=$1", [customerId])
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});

app.get("/customers/:customerId/bookings", (req, res) => {
  const customerId = req.params.customerId;

  pool
    .query(
      "SELECT b.checkin_date, b.nights, h.name, h.postcode FROM bookings b INNER JOIN hotels h on h.id= b.hotel_id INNER JOIN customers f on f.id=b.customer_id WHERE f.id=$1",
      [customerId]
    )
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});

app.put("/customers/:customerId", (req, res) => {
  const id = req.params.customerId;
  const name = req.body.name;
  const email = req.body.email;
  const address = req.body.address;
  const city = req.body.city;
  const postcode = req.body.postcode;
  const country = req.body.country;

  pool.query("SELECT * FROM customers WHERE id=$1", [id]).then((result) => {
    if (result.rows.length === 0) {
      return res.status(400).send("We couldn't find ID!");
    } else {
      const query =
        "UPDATE customers SET name=$2, email=$3, address=$4, city=$5, postcode=$6, country=$7 WHERE  id=$1";
      pool
        .query(query, [id, name, email, address, city, postcode, country])
        .then(() => res.send("Customer Updated!!!"))
        .catch((e) => console.error(e));
    }
  });
});

app.delete("/customers/:customerId", (req, res) => {
  const customerId = req.params.customerId;

  pool
    .query("DELETE FROM customers WHERE id=$1", [customerId])
    .then(() => {
      pool
        .query("DELETE FROM customers WHERE id=$1", [customerId])
        .then(() => res.send(`Customer ${customerId} deleted!`))
        .catch((e) => console.error(e));
    })
    .catch((e) => console.error(e));
});

app.delete("/hotels/:hotelId", (req, res) => {
  const hotelId = req.params.hotelId;

  pool
    .query("DELETE FROM hotels WHERE id=$1", [hotelId])
    .then(() => {
      pool
        .query("DELETE FROM hotels WHERE id=$1", [hotelId])
        .then(() => res.send(`Hotel ${hotelId} deleted!`))
        .catch((e) => console.error(e));
    })
    .catch((e) => console.error(e));
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}. Ready to accept requests!`);
});
