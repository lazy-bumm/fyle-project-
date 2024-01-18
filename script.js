$(document).ready(function () {
    let perPage = 10;
    let currentPage = 1;

  
    var accessToken = config.accessToken;

    function searchRepositories() {
        const username = $('#usernameInput').val();
        // console.log(perPage);
        // Display loader while fetching user informatyion
        $('#user-info').html('<p class="text-center"><i class="fa fa-spinner fa-spin"></i> Loading...</p>');

        // Fetch user information 
        $.ajax({
            url: `https://api.github.com/users/${username}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            success: function (user) {
                // Display user information
                $('#user-info').html(`
                <div class="user-header">
                    <img src="${user.avatar_url}" alt="User Avatar" class="avatar">
                    <div class="user-info">
                        <h2>${user.name || username}</h2>
                        <p>Followers: ${user.followers} | Following: ${user.following}</p>
                        <div class="user-details">
                        <p><strong>Bio:</strong> ${user.bio || 'Not available'}</p>
                        <p><strong>Blog:</strong> ${user.blog || 'Not available'}</p>
                    </div>
                    </div>
                </div>
               
                <div class="github-link">
                    <a href="${user.html_url}" target="_blank">Visit GitHub Profile</a>
                </div>
            `);
            },
            error: function () {
                // Display error message for invalid username
                $('#user-info').html('<p class="text-danger">Invalid username. Please enter a valid GitHub username.</p>');
                $('#repositories').empty();
            }
        });

        // Display loader while fetching user repositories
        $('#repositories').html('<p class="text-center"><i class="fa fa-spinner fa-spin"></i> Loading repositories...</p>');

        // Fetch user repositories with pagination and authentication
        $.ajax({
            url: `https://api.github.com/users/${username}/repos`,
            method: 'GET',
            data: { per_page: perPage, page: currentPage },
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            success: async function (repositories) {
                // Display user repositories
                const repositoriesSection = $('#repositories');
                repositoriesSection.html('<h2>Repositories:</h2>');

    

                // Loop through repositories
                for (const repo of repositories) {
                    // Create repository box
                    const repoBox = $('<div class="card mb-3"></div>');

                    // Fetch languages (topics) asynchronously
                    
                    async function getRepoLanguages(owner, repoName) {
                        const response = await $.get(`https://api.github.com/repos/${owner}/${repoName}/languages`);
                        return Object.keys(response);
                    }

                        // Fetch languages( topics)
                        const languages = await getRepoLanguages(username, repo.name);
                        const topics=repo.topics;

                        // Display languages in small blue boxes
                        const languagesHTML = languages.map(lang => `<span class="badge badge-primary">${lang}</span>`).join(' ');
                        const topicsHTML = topics.map(topic=> `<span class="badge badge-secondary">${topic}</span>`).join(' ');

                    // Populate repository box with repo details including languages
                    repoBox.html(`
                        <div class="card-body">
                            <h3 class="card-title"><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
                            <p class="card-text">${repo.description || 'No description available'}</p>
                            <div class="languages">Languages: ${languagesHTML}</div>
                            <div class="languages">Topics: ${topicsHTML || 'No topics added'}</div>
                        </div>
                    `);

                    repositoriesSection.append(repoBox);
                }
            },
            complete: function () {
                // Remove loader 
                $('#repositories').find('.loader').remove();
            }
        });
    }


 

    // Trigger search when Enter key is pressed in the input field
    $('#usernameInput').keyup(function (event) {
        if (event.key === 'Enter') {
            searchRepositories();
        }
    });
    $('#searchRepo').on('click', function () {
        searchRepositories();
    });

    // Example of implementing next page button
    $('#nextPageButton').on('click', function () {
        currentPage++;
        searchRepositories();
    });

    // Example of implementing previous page button
    $('#prevPageButton').on('click', function () {
        if (currentPage > 1) {
            currentPage--;
            searchRepositories();
        }
    });

    // Update number of repositories per page based on user selection
    $(document).on('change', '#perPageSelect', function () {
        perPage = parseInt($(this).val());
        searchRepositories();
    });
    
});