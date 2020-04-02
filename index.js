const express = require("express")
const app = express()

const cors = require("cors")
app.use(cors())

const databaseConfig = require("./knexfile")[process.env.NODE_ENV || "development"]
const knex = require("knex")
const database = knex(databaseConfig)

const { Model } = require("objection")

Model.knex(database)

app.listen(process.env.PORT || 4000)

class Dog extends Model {
  static get tableName(){
    return "dog"
  }

  static get relationMappings(){
    return {
      owners: {
        relation: Model.ManyToManyRelation,
        modelClass: Owner,
        join: {
          from: "dog.id",
          through: {
            from: "dog_owner.dog_id",
            to: "dog_owner.owner_id"
          },
          to: "owner.id"
        }
      }
    }
  }
}

class Owner extends Model {
  static get tableName(){
    return "owner"
  }
  
  static relationMappings = {
    dogs: {
      relation: Model.ManyToManyRelation,
      modelClass: Dog,
      join: {
        from: "owner.id",
        through: {
          from: "dog_owner.owner_id",
          to: "dog_owner.dog_id"
        },
        to: "dog.id"
      }
    }
  }
}

class DogOwner extends Model {
  static get tableName(){
    return "dog_owner"
  }
}

app.get("/dogs", async (request, response) => {
  const dogs = await Dog.query().withGraphFetched("owners")
  response.json({ dogs })
})

app.get("/owners", async (request, response) => {
  const owners = await Owner.query().withGraphFetched("dogs")
  response.json({ owners })
})

app.get("/dog_owners", async (request, response) => {
  const dog_owners = await DogOwner.query().select("*")
  response.json({ dog_owners })
})
