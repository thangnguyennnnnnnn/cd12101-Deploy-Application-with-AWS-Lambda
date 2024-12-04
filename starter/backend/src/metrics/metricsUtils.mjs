import AWS from 'aws-sdk'
const cloudwatch = new AWS.CloudWatch()

export async function recordMetric(metricName, value) {
  await cloudwatch.putMetricData({
    Namespace: 'MyApp/Metrics',
    MetricData: [
      {
        MetricName: metricName,
        Value: value,
        Unit: 'Count'
      }
    ]
  });
  console.log('Done');
}
