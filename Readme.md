# Avidian Project

## Overview
The Avidian Project consists of three main parts:

1. **Frontend** - Developed using React and Vite.
2. **Backend** - Built with ASP.NET Core C#.
3. **Admin Panel** - Used to dynamically manage the frontend, also developed with React and Vite.

Main directory - AVIDIAN

Frontend dorectory - frontend

Backend directory - backend-dotnet

Admin Panel directory -Admin

## Video Walkthrough
https://drive.google.com/drive/folders/1i6-UbsikHumdItU6hoSl6m5S3KGAPd0o

## Website Summary docs
https://docs.google.com/document/d/1eI0LMbFNkb9TnqX_J8lKVhU9ilLqLglurAWCds21uU4/edit?tab=t.0


## How to Clone the Repository
```sh
# Clone the repository
git clone https://github.com/akthartauqeer/avidian-project.git


# Navigate to the project directory
cd avidian-project
```

## Running the Project with Docker
Since the project includes a `docker-compose.yml` file, it can be easily run using Docker.

### **Steps to Run with Docker**
```sh
# Make sure Docker is installed and running

##Navigate to the project directory
cd avidian-project

# Build and start the containers
docker-compose up --build
```

This will start the frontend, backend, and admin services automatically.

## Images and Where They Run
The following images are used in the project:
- **akthartauqeer/avidian-frontend** - Runs the React Vite frontend on port `3000`.
- **akthartauqeer/backend-dotnet** - Runs the ASP.NET Core backend on port `5045`.
- **akthartauqeer/avidian-admin** - Runs the React Vite admin panel on port `3002`.
- **akthartauqeer/mysql:8.0** - Runs the MySQL database on port `3306`.

## Docker Desktop Requirement
To run the project using Docker, ensure that **Docker Desktop** is installed. If not, download it from [Docker Desktop](https://www.docker.com/products/docker-desktop/).

For additional guidance, refer to the [Docker Documentation](https://docs.docker.com/get-docker/).

## Firebase Credentials
Since `firebaseserviceaccountkey.json` cannot be exposed, it will be provided personally via email. 

After cloning the repository, follow these steps:
1. Navigate to `dotnet-backend/FirebaseCredentials/serviceAccountKey.json`.
2. The file will be empty in GitHub.
3. Paste the contents from the email into this file.
4. Run the `docker-compose up --build` command to start the project.

## The credentials to login on the webiste both frontend and admin is 
email - info@avidian.com password - D@shWeb123

