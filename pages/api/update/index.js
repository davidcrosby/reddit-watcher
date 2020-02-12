import DataFetcher from '../../../utils/DataFetcher.js';

const DF = new DataFetcher();

export default (req, res) => {
  if(!process.env.DF_RUNNING) {
    DF.toRepeat();
    process.env.DF_RUNNING=true;
  }
  return res.status(200).json(DF.subredditPostCount);
}
