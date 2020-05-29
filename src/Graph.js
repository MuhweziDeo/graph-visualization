import React from "react";
import Axios from "axios";
import { Snackbar, Typography, Container } from "@material-ui/core";
import {
  BarChart, XAxis, YAxis, Bar, Tooltip, Legend, CartesianGrid,
  Line, LineChart, Pie, PieChart
} from 'recharts';
import CircularProgress from '@material-ui/core/CircularProgress';


import { API_URL, USERNAME as username, PASSWORD as password } from "./config";

export const Graphs = props => {
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [data, setData] = React.useState([]);
  const [verifiedTweets, setVerifiedTweets] = React.useState([]);
  const [mostRetweets, setMostRetweets] = React.useState([]);
  const[loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data: tweets } = await Axios.get(API_URL, {
          headers: {
            "content-type": "application/json",
          }, auth: { username, password }
        });
        if (Array.isArray(tweets)) {
          const locationObj = {};
          tweets.forEach(tweet => {
            if (tweet.user.location) {
              locationObj[tweet.user.location] = locationObj[tweet.user.location] ?
                locationObj[tweet.user.location] + 1 : 1;
            } else {
              locationObj["Unknown"] = locationObj["Unknown"] ? locationObj["Unknown"] + 1 : 1;
            }
          });
          const groupedData = Object.keys(locationObj).map((o) => ({ value: locationObj[o], name: o }));

          setData(groupedData);

          const verifiedTweetsObj = {};
          tweets.forEach((tw) => {
            if (tw.user.verified) {
              verifiedTweetsObj["verified"] = verifiedTweetsObj["verified"] ? ++verifiedTweetsObj["verified"] : 1
            } else {
              verifiedTweetsObj["Non-Verified"] = verifiedTweetsObj["Non-Verified"] ? ++verifiedTweetsObj["Non-Verified"] : 1
            }
          });
          setVerifiedTweets(Object.keys(verifiedTweetsObj).map((o) => ({ value: verifiedTweetsObj[o], name: o })));
          setMostRetweets(tweets.map((t) => ({name: t.user.location || "unknown", retweetCount: t.retweet_count})));
          setLoading(false);
        }
      } catch (error) {
        setVisible(true);
        setLoading(false);
        setMessage(error.message ?.error || "Error occured");
        setTimeout(() => {
          setVisible(false);
          setMessage("");
        }, 3000)
      }
    })()
  }, [])

  return (
    <>
      <Snackbar
        message={message}
        open={visible}
        autoHideDuration={2000}
      />
      {
        loading ? <CircularProgress  size={200}/> : <> 
              <>
        <Typography variant="h4" style={{ textAlign: "center" }}>Tweets by Location</Typography>
        <BarChart width={900} height={250} data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Legend />
          <CartesianGrid strokeDasharray="3 3" />
          <Bar dataKey="value" fill="#8884d8" />
          <Tooltip />
        </BarChart>
      </>

      <Container>
        <Typography variant="h4" style={{ textAlign: "center" }}>Tweets by Verified users</Typography>
        <PieChart width={730} height={250}>
          <Pie
            data={verifiedTweets}
            dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#82ca9d"
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              value,
              name
            }) => {
              const RADIAN = Math.PI / 180;
              // eslint-disable-next-line
              const radius = 25 + innerRadius + (outerRadius - innerRadius);
              // eslint-disable-next-line
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              // eslint-disable-next-line
              const y = cy + radius * Math.sin(-midAngle * RADIAN);

              return (
                <text
                  x={x}
                  y={y}
                  fill="#8884d8"
                  textAnchor={x > cx ? "start" : "end"}
                  dominantBaseline="central"
                >
                  {name} {value}
                </text>
              );
            }}
          />
        </PieChart>
      </Container>

      <Container>
        <Typography variant="h4" style={{ textAlign: "center" }}> Most Retweets by location</Typography>
        <LineChart width={730} height={250} data={mostRetweets.filter((m) => m.retweetCount > 50)}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="retweetCount" stroke="#8884d8" />
        </LineChart>
      </Container>
        
        </>
      }
    </>
  );

}
