import redis from 'redis'

export const redisClient = redis.createClient({
  host: 'redis',
  port: 6379
})

redisClient.on('connect', () => {
  console.log('Redis client connected!')
})

redisClient.on('error', err => {
  console.log('Something went wrong ' + err);
});
