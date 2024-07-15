document.getElementById('handleForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const handle = document.getElementById('handle').value;
    fetchUserInfo(handle);
    fetchUserRating(handle);
});

function fetchUserInfo(handle) {
    const url = `https://codeforces.com/api/user.info?handles=${handle}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === "OK") {
                displayUserInfo(data.result[0]);
            }
        })
}

function displayUserInfo(user) {
    const userInfoDiv = document.getElementById('userInfo');
    userInfoDiv.innerHTML = `
        <table>
            <tr><th>Handle</th><td>${user.handle}</td></tr>
            <tr><th>Rating</th><td>${user.rating}</td></tr>
            <tr><th>Max Rating</th><td>${user.maxRating}</td></tr>
            <tr><th>Rank</th><td>${user.rank}</td></tr>
            <tr><th>Max Rank</th><td>${user.maxRank}</td></tr>
            <tr><th>Registration Time</th><td>${new Date(user.registrationTimeSeconds * 1000).toLocaleDateString()}</td></tr>
            <tr><th>Last Online</th><td>${new Date(user.lastOnlineTimeSeconds * 1000).toLocaleDateString()}</td></tr>
        </table>
    `;

    const submissionsDiv = document.getElementById('submissionsDiv');
    submissionsDiv.style.display = 'block';
    document.getElementById('fetchSubmissionsButton').addEventListener('click', () => fetchUserSubmissions(user.handle));
}

function fetchUserSubmissions(handle) {
    const count = document.getElementById('submissionCount').value;
    const url = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=${count}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === "OK") {
                displayUserSubmissions(data.result);
                drawRatingChart(data.result);
            } else {
                alert("Error fetching user submissions");
            }
        })
        .catch(error => {
            console.error('Error fetching user submissions:', error);
            alert("Error fetching user submissions");
        });
}

function displayUserSubmissions(submissions) {
    const submissionsDiv = document.getElementById('submissions');
    let tableHTML = `
        <table>
            <tr><th>Problem</th><th>Language</th><th>Verdict</th><th>Time</th></tr>
    `;

    submissions.forEach(submission => {
        tableHTML += `
            <tr>
                <td>${submission.problem.name}</td>
                <td>${submission.programmingLanguage}</td>
                <td>${submission.verdict}</td>
                <td>${new Date(submission.creationTimeSeconds * 1000).toLocaleString()}</td>
            </tr>
        `;
    });

    tableHTML += `</table>`;
    submissionsDiv.innerHTML = tableHTML;
}

function drawRatingChart(submissions) {
    const ratings = {};

    submissions.forEach(submission => {
        const rating = submission.problem.rating || "Unrated";
        if (ratings[rating]) {
            ratings[rating]++;
        } else {
            ratings[rating] = 1;
        }
    });

    const ctx = document.getElementById('ratingChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(ratings),
            datasets: [{
                label: 'Number of Problems',
                data: Object.values(ratings),
                backgroundColor: '#4CAF50',
                borderColor: '#388E3C',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function fetchUserRating(handle) {
    const url = `https://codeforces.com/api/user.rating?handle=${handle}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === "OK") {
                drawUserRatingChart(data.result);
            } else {
                alert("Error fetching user rating history");
            }
        })
        .catch(error => {
            console.error('Error fetching user rating history:', error);
            alert("Error fetching user rating history");
        });
}

function drawUserRatingChart(ratingData) {
    const dates = ratingData.map(entry => new Date(entry.ratingUpdateTimeSeconds * 1000).toLocaleDateString());
    const ratings = ratingData.map(entry => entry.newRating);

    const ctx = document.getElementById('userRatingChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Rating',
                data: ratings,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}
