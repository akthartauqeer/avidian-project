import React from 'react';

// ModifiedQuery.js
function ModifiedQuery(query, selectedValues) {
    // Remove the last semicolon if it exists
    if (query.endsWith(';')) {
        query = query.slice(0, -1).trim();
    }

    // If there are no selected values, return the original query
    if (Object.keys(selectedValues).length === 0) {
        return query;
    }

    // Construct the WHERE clause based on selectedValues
    const whereClause = Object.entries(selectedValues)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(" AND ");

    // Regular expression to find "FROM" keywords followed by any number of spaces
    const fromRegex = /\bFROM\s+/gi;
    let modifiedQuery = query;
    let match;

    // Array to store the insertion indexes for each FROM match
    const insertions = [];

    // Iterate through each "FROM" occurrence
    while ((match = fromRegex.exec(query)) !== null) {
        // Capture the index of "FROM" keyword in the query
        const fromIndex = match.index;

        // Find the character immediately after "FROM" and any spaces
        const afterFrom = query.slice(fromIndex + match[0].length); // Skip "FROM " and spaces
        const nextChar = afterFrom.charAt(0); // Get the next character

        // If the next character is not '(', we can add the WHERE clause
        if (nextChar !== '(') {
            // Find the end of the table name (next space or "(" after "FROM <table>")
            const nextSpaceIndex = afterFrom.search(/\s|\(/); // Look for next space or "("
            const tableEndIndex = nextSpaceIndex !== -1 ? nextSpaceIndex + fromIndex + match[0].length : query.length;

            // Determine if this FROM clause already has a WHERE clause after the table name
            const followingText = query.slice(tableEndIndex);
            const hasWhere = /^WHERE\s/i.test(followingText.trim());

            // If there is no WHERE clause, we'll insert our constructed WHERE clause
            if (!hasWhere) {
                insertions.push({
                    startIndex: tableEndIndex,
                    text: ` WHERE ${whereClause} `
                });
            } else {
                insertions.push({
                    startIndex: tableEndIndex,
                    text: ` WHERE ${whereClause} and `
                });
            }
        }
        // If the next character is '(', we skip this FROM clause and do nothing
    }

    // Insert new WHERE clauses in reverse order to avoid index shifting
    insertions.reverse().forEach(({ startIndex, text }) => {
        modifiedQuery = modifiedQuery.slice(0, startIndex) + text + modifiedQuery.slice(startIndex);
    });

    // Replace all occurrences of "and where" with "and"
    modifiedQuery = modifiedQuery.replace(/and\s+where/gi, "and");

    console.log("Modified Query:", modifiedQuery);
    return modifiedQuery;
}

export default ModifiedQuery;
