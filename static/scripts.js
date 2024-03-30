function clearVideoDisplay() {
    const message = document.getElementById('video-text');
    if (message) {
        while (message.firstChild) {
            message.removeChild(message.firstChild);
        }
    } else {
        console.error('No div with id "video-text" found.');
    }

    const videoDisplayDiv = document.getElementById('video-display');
    if (videoDisplayDiv) {
        while (videoDisplayDiv.firstChild) {
            videoDisplayDiv.removeChild(videoDisplayDiv.firstChild);
        }
    } else {
        console.error('No div with id "video-display" found.');
    }
}

function clearGeneratedContent() {
    const message = document.getElementById('generated-header');
    if (message) {
        while (message.firstChild) {
            message.removeChild(message.firstChild);
        }
    } else {
        console.error('No div with id "generated-header" found.');
    }

    const generatedContentDiv = document.getElementById('generated-content');
    if (generatedContentDiv) {
        // Clear inner HTML
        generatedContentDiv.style.display = 'none';
    } else {
        console.error('No div with id "generated-content" found.');
    }
}

function fetchData(searchText) {
    const APIKey = ' '; // Replace with your API key
    fetch(`https://www.googleapis.com/youtube/v3/search?key=${APIKey}&q=${searchText}&type=video&part=snippet`)
        .then(response => {
            if (!response.ok) {
                alert('Sorry my youtube tokens are over for the day 🥲. But you can come back after 12 AM PT 😁');
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const videoIds = data.items.slice(0, 3).map(item => item.id.videoId);
            sendToBackend(videoIds);
        })
        .catch(error => {
            document.getElementById('searchInput').disabled = false;
            document.getElementById('error-text').style.display = 'block';
        });
    }

function sendToBackend(videoIds) {
    // Send the video IDs to the backend
    fetch('/your-backend-endpoint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ videoIds: videoIds })
    })
    .then(response => {
        if (response.ok) {
            console.log('Video IDs sent to the backend successfully.');
            return response.json(); // Parse response body as JSON
        } else {
            console.error('Failed to send video IDs to the backend.');
        }
    })
    .then(data => {
        // Handle the response containing the generated article
        if (data && data.article) {
            console.log('Received article from the backend:');
            // Display the article on the frontend

            const message = document.getElementById('generated-header');
            const content = '<h2>The Generated Article:</h2>';
            message.innerHTML = content;

            const loadingBar = document.getElementById('loading-bar');
            const searchButton = document.getElementById('searchButton');

            const generatedContentDiv = document.getElementById('generated-content');
            if (generatedContentDiv) {
                generatedContentDiv.innerHTML = data.article;
                generatedContentDiv.style.display = 'block';
                loadingBar.style.display = 'none';
                searchButton.disabled = false;
            } else {
                loadingBar.style.display = 'none';
                console.error('No div with id "generated-content" found.');
            }
            // Display YouTube video thumbnails
            displayVideoThumbnails(videoIds);
        } else {
            loadingBar.style.display = 'none';
            console.error('No article received from the backend.');
        }
    })
    .catch(error => {
        const loadingBar = document.getElementById('loading-bar');
        loadingBar.style.display = 'none';
        console.error('Error sending data to backend:', error);
    });
}

function displayVideoThumbnails(videoIds) {
    const message = document.getElementById('video-text');
    const content = '<h2>Top YouTube video results:</h2>';
    message.innerHTML = content;

    const loadingBar = document.getElementById('loading-bar');
    const videoDisplayDiv = document.getElementById('video-display');
    if (!videoDisplayDiv) {
        loadingBar.style.display = 'none';
        console.error('No div with id "video-display" found.');
        return;
    }

    videoIds.forEach(videoId => {
        // Create a thumbnail element for each video
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const thumbnailElement = document.createElement('img');
        thumbnailElement.src = thumbnailUrl;
        thumbnailElement.alt = 'YouTube Video Thumbnail';

        // Open video in new tab when clicked
        thumbnailElement.addEventListener('click', function() {
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            window.open(videoUrl, '_blank');
        });

        videoDisplayDiv.appendChild(thumbnailElement);
    });

    message.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchForm').addEventListener('submit', function(event) {
        event.preventDefault();
        var searchText = document.getElementById('searchInput').value;
        console.log('Search Text:', searchText);
        const loadingBar = document.getElementById('loading-bar');
        loadingBar.style.display = 'block';
        const searchButton = document.getElementById('searchButton');
        searchButton.disabled = true;
        clearVideoDisplay();
        clearGeneratedContent();

        // Make API call to get data
        fetchData(searchText);
    });
});