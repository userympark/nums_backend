const axios = require("axios");

const testData = `600	2014.05.31	15	901,798,725원	41	54,987,728원	1,518	1,485,176원	77,138	50,000원	1,258,677	5,000원	5	11	14	27	29	36	44
599	2014.05.24	8	1,710,918,329원	43	53,051,732원	1,685	1,353,843원	79,069	50,000원	1,297,530	5,000원	5	12	17	29	34	35	27`;

async function testUpload() {
  try {
    console.log("🔄 로또 데이터 업로드 테스트 시작...");

    const response = await axios.post(
      "http://localhost:8080/api/lotto/upload",
      {
        data: testData,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ 업로드 성공!");
    console.log("응답:", JSON.stringify(response.data, null, 2));

    // 업로드 후 데이터 조회 테스트
    console.log("\n🔄 업로드된 데이터 조회 테스트...");
    const getResponse = await axios.get("http://localhost:8080/api/lotto");
    console.log("✅ 조회 성공!");
    console.log("조회 결과:", JSON.stringify(getResponse.data, null, 2));
  } catch (error) {
    console.error("❌ 오류 발생:");
    if (error.response) {
      console.error("상태 코드:", error.response.status);
      console.error("응답 데이터:", error.response.data);
    } else {
      console.error("오류 메시지:", error.message);
    }
  }
}

// 특정 회차 조회 테스트
async function testGetByRound() {
  try {
    console.log("\n🔄 특정 회차 조회 테스트...");
    const response = await axios.get("http://localhost:8080/api/lotto/600");
    console.log("✅ 특정 회차 조회 성공!");
    console.log("조회 결과:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("❌ 특정 회차 조회 오류:", error.response?.data || error.message);
  }
}

// 메인 테스트 함수
async function runTests() {
  console.log("🚀 API 테스트 시작\n");
  
  await testUpload();
  await testGetByRound();
  
  console.log("\n✨ 모든 테스트 완료!");
}

// 스크립트가 직접 실행될 때만 테스트 실행
if (require.main === module) {
  runTests();
}

module.exports = { testUpload, testGetByRound, runTests };
