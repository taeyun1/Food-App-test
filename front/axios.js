// axios
//   .get("https://jsonplaceholder.typicode.com/todos/1")
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

async function dummy() {
  try {
    const res = await axios.get("http://localhost:3000/restaurants");
    const resData = res.data.result;
    let num = 0;
    for (let i = 0; i < resData.length; i++) {
      num++;
      // console.log(num, resData[i]);
    }
  } catch (err) {
    console.error(err);
  }
}

dummy();
