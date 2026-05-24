
# Food Recipe Website

A full satck recipe management application designed to help users to share, discover and organize their favorite recipes. 


## Overview

Food-Co is a platform that allow users to create public or private recipes, save recipes from others, and interact with a global tag system. It includes advanced filtering, sorting and search capabilities to ensure seamless user experience.

## Features

- Authentication: Implement secure user registration/login via email and google oauth.
- Recipe Management: User can perform create, read, update and delete functionality for personal recipes.
- Smart discovery: Advanced search, filtering, and sorting based on number of ingredients, time, etc, with pagination.
- Saved Recipes: A dedicated page to view, sort and manage saved recipes.
- Personal notes: User can add, view and delete private notes to any saved recipe.
- Popular recipes: Real time display of the top 3 most saved recipes on the homepage.


## Tech Stack

* Frontend: React.js, Material UI
* Backend: Node.js, typescript, type-graphql
* Database: PostgreSQL, TypeORM
* API: Graphql


## Prerequisites

You will need to have the following software installed on your machine:
* [Node.js](https://nodejs.org/en/download)
* [PostgreSQL](https://www.postgresql.org/download)

## Installation

1.** Clone the repository**
```bash
  git clone [https://github.com/Jahnavi-Celestial/Food-Recipe-App-.git](https://github.com/Jahnavi-Celestial/Food-Recipe-App-.git)
  cd Food-Recipe-App-
```

2.** Backend Setup**
```bash
  cd backend
  npm install 
  # Create a .env file and add your configuration(see below)
  npm run dev
```

3.** Frontend Setup**
```bash
  cd ../frontend
  npm install 
  # Create a .env file and add your configuration(see below)
  npm run dev
```
    
## Environment Variables

Create a .env file in your root/backend directory with following keys:

`JWT_SECRET =  your_jwt_secret_key`

`DATABASE_URL = your_database_url`

`GOOGLE_CLIENT_ID = your_google_client_id`

`FRONTEND_URL = your_frontend_url`

Create a .env file in your root/frontend directory with follwing keys:

`VITE_GOOGLE_CLIENT_ID = your_google_client_id`

`VITE_BACKEND_URL = your_backend_url`

## Project Structure

* /frontend: Contains the react application and material ui components.
* /backend: Contains the node.js/typescript server and graphql resolvers.
