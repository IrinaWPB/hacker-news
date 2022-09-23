

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/** Creates a markup for a story instance, returns that hHTML*/
function generateStoryMarkup(story, showTrashCan = false) {
  const hostName = story.getHostName();
  const showStar = Boolean(currentUser);

  //if user is logged in show star with current starType(marked or not)
  //adds a star icon for logged in user and delete icon for user sttories
  return $(`
      <li id="${story.storyId}">  
        ${showTrashCan ? addTrashCan() : ""}
        ${showStar ? typeOfStar(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}
//Creates delete icon
function addTrashCan() { 
  return `<span class="trash-can">
          <i class="fas fa-trash-alt"></i>
        </span>`;  
}

//Creates a markup for a star for regular and favorite stories
function typeOfStar(story, user) {
  //check if the story is marked as favorite
  const isFavorite = user.isFavorite(story);
  //if favorite - show solid star, if not - outlined.
  const starType = isFavorite ? 'fas' : 'far';
  return `
        <span class="star">
          <i class="fa-star ${starType}"></i>
        </span>`;
}

// Gets list of stories from server, generates their HTML, and puts on page. */
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  $allStoriesList.empty();
  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
}

// Adds a new story to stories list and inserts to the page on form submit
async function submitNewStory(e) {
  e.preventDefault();
  const author = $('#add-author').val();
  const title = $('#add-title').val();
  const url = $('#add-url').val();

  const story = await storyList.addStory(currentUser, { title, author, url});
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  $storyForm.hide();
  $storyForm.trigger('reset');
}
$storyForm.on('submit', submitNewStory);

// Removes a story from server and and page 
async function deleteMyStory(e) {
  const storyId = e.target.parentElement.parentElement.id;
  console.log(storyId);
  await storyList.deleteStory(currentUser, storyId);
  //recreate user stories list
  await putMyStoriesOnPage();
}
$myStories.on('click', '.trash-can', deleteMyStory);

//AddsTo/removeFrom favorites on star click
async function starUnstarStory(e) {
  const storyId = e.target.parentElement.parentElement.id;
  console.log(storyId);
  const story = storyList.stories.find(s => s.storyId === storyId);
  const favClass = e.target.classList;

  //if a star is outlined - add the story to favorites on click
  if (favClass.contains('far')) { 
    await currentUser.addToFavorites(story);
    //change its class to solid to represent favorite story
    favClass.add('fas');
    favClass.remove('far');

  //if the story is already favorite - removes it from users favorites on click
  } else {
    await currentUser.removeFromFavorites(story);
    favClass.remove('fas');
    favClass.add('far');
  }
}
$storiesLists.on('click', '.star', starUnstarStory);

//Populates and shows favorites list
function putFavoriteListOnPage() {
  $favoriteStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoriteStories.append("<h5>No favorites added!</h5>");
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoriteStories.append($story);
    }
  }
  $favoriteStories.show();
}
//creates and shows the list of user stories
function putMyStoriesOnPage() {
  $myStories.empty();

  if (currentUser.ownStories.length === 0) {
    $myStories.append("<h5>You haven't created any stories yet!</h5>");
  } else {
    for (let story of currentUser.ownStories) {
      //Generates Markup for own stories with 'showDeleteIcon" set to true.
      const $story = generateStoryMarkup(story, true);
      $myStories.append($story);
    }
  }
  $myStories.show();
}