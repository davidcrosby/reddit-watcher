import DataFetcher from '../../../utils/DataFetcher.js';

const DF = new DataFetcher();

export default (req, res) => {
  if(!process.env.DF_RUNNING) {
    DF.toRepeat();
    process.env.DF_RUNNING=true;
  }
  let json_res = {
    subredditPostCount: DF.subredditPostCount,
    timeLeft: DF.timeLeft
  }
  return res.status(200).json(json_res);
}
