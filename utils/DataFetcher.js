const config = require('../config.json');
const snoowrap = require('snoowrap');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default class DataFetcher {
  constructor(
    delay=1000 /* min delay between requests, miliseconds */,
    resetTime=300 * 1000 /* interval between data reset */
  ) {
    this.resetData();
    this.delay = delay;
    this.resetTime = resetTime;
    this.reddit = new snoowrap({
      userAgent: config.userAgent,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      refreshToken: config.refreshToken,
      requestDelay: this.delay
    });
  }

  resetData() {
    this.subredditPostCount = {};
    this.seen = {};
    this.createdAt = new Date().getTime();
  }

  fetchData = async function() {
    let rout = [];
    try {
      rout = await this.reddit.getSubreddit('all').getNew();
    } catch(err) {
      console.log(err);
    }
    return rout;
  }

  updateSubredditPostCount() {
    const timeDiff = (new Date().getTime()) - this.createdAt;
    if(timeDiff > this.resetTime) {
      this.resetData();
      return;
    }
    this.timeLeft = this.resetTime - timeDiff;
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

  async toRepeat(timeOut=this.delay) {
    console.log(this.subredditPostCount);
    this.updateSubredditPostCount();
    setTimeout(() => this.toRepeat(timeOut), timeOut);
  }
}

