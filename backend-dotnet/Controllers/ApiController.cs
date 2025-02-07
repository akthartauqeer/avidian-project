using FirebaseAdmin.Auth;
using Dapper;              // For Dapper's extension methods like ExecuteAsync and QueryAsync
using MySql.Data.MySqlClient;  // For MySQL connection

using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Text.Json;

namespace YourNamespace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApiController : ControllerBase
    {
        private readonly IDbConnection _dbConnection;

        public ApiController(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection;
        }

        // Route to fetch Firebase Authentication users' email and last signed-in time
        [HttpGet("firebase-users")]
        public async Task<IActionResult> GetFirebaseUsers()
        {
            try
            {
                var users = FirebaseAuth.DefaultInstance.ListUsersAsync(null);
                var userList = new List<object>();

                await foreach (var user in users)
                {
                    userList.Add(new
                    {
                        uid = user.Uid,
                        email = user.Email,
                    });
                }

                return Ok(userList);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error fetching Firebase users: " + ex.Message);
                return StatusCode(500, "Internal Server Error");
            }
        }

        // Route to execute SQL queries
        [HttpPost("run-sql")]
        public async Task<IActionResult> RunSqlQuery([FromBody] JsonElement body)
        {
            try
            {
                var query = body.GetProperty("query").GetString();
                if (string.IsNullOrEmpty(query))
                {
                    return BadRequest(new { error = "Invalid query. Query must be a non-empty string." });
                }

                // Validate the query (basic example: you can improve this validation)
                await _dbConnection.ExecuteAsync($"EXPLAIN {query}");

                // Execute query
                var result = await _dbConnection.QueryAsync(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error executing query: " + ex.Message);
                return StatusCode(500, new { error = "Failed to execute SQL query" });
            }
        }

        // Route to delete Firebase user
        [HttpDelete("delete-user/{uid}")]
        public async Task<IActionResult> DeleteUser(string uid)
        {
            try
            {
                // Delete user from Firebase Authentication
                await FirebaseAuth.DefaultInstance.DeleteUserAsync(uid);
                Console.WriteLine($"User with UID: {uid} deleted from Firebase Authentication.");

                return Ok(new { message = $"User with UID: {uid} deleted successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error deleting user: " + ex.Message);
                return StatusCode(500, new { error = "Failed to delete user." });
            }
        }

        // Test Route
        [HttpGet]
        public IActionResult TestRoute()
        {
            return Ok("Hello, World!");
        }
    }
}
