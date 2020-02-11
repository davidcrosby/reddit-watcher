const config = require('./config.json');
const snoowrap = require('snoowrap');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default class DataFetcher {
  constructor(delay /* min delay between requests, miliseconds */) {
    this.subredditPostCount = {};
    this.seen = {};
    this.reddit = new snoowrap({
      userAgent: config.userAgent,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      refreshToken: config.refreshToken,
      requestDelay: delay / 2
    });
  }

  fetchData = async function() {
    let rout = [];
    try {
      rout = await this.reddit.getSubreddit('all').getNew();
    } catch(err) {
      if(err.code == "ETIMEDOUT") {
        console.log(err);
      }
    }
    return rout;
  }

  updateSubredditPostCount() {
    try {
      this.fetchData().then((data) => {
        data.forEach((post) => {
          if(!this.seen[post.title]) {
            let subredditTitle = post.subreddit.display_name;
            if (!subredditTitle.match('^u_')) { /* skip usernames */
              if(this.subredditPostCount[subredditTitle]) 
              this.subredditPostCount[subredditTitle] += 1;
            else
              this.subredditPostCount[subredditTitle] = 1;
            }
            this.seen[post.title] = 1;
          }
        });
      });
    } catch(e) {
      console.log(e);
    }
  }

  async toRepeat(callback, timeOut) {
    this.updateSubredditPostCount();
    try {
      callback(this.subredditPostCount);
    } catch(e) {
      console.log(e);
    }
    setTimeout(() => this.toRepeat(callback, timeOut), timeOut);
  }
}

