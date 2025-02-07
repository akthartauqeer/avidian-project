# Use official .NET 9 SDK image for build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy the project and restore dependencies
COPY backend-dotnet.csproj ./
RUN dotnet restore

# Copy the rest of the app and build
COPY . ./
RUN dotnet publish -c Release -o /publish

# Use runtime-only .NET image for final container
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /publish .

# Copy Firebase credentials
COPY FirebaseCredentials/ServiceAccountKey.json /app/FirebaseCredentials/serviceAccountKey.json

# **Copy data.sql from the parent directory (avidian/)**
COPY data.sql /app/data.sql

# Expose the application port
EXPOSE 5045

# Set entrypoint
ENTRYPOINT ["dotnet", "backend-dotnet.dll"]
