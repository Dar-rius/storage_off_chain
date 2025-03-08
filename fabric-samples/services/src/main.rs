pub mod features;
use axum::{routing::post, Router};
use axum_test::TestServer;
use serde_json::json;
use axum::http::StatusCode;

//Main function 
#[tokio::main]
async fn main(){
    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/insertData", post(features::insert_data))
        .route("/retrieveData", post(features::retrieve))
        .route("/insertFile", post(features::insert_file))
        .route("/retrieveFile", post(features::retrieve_file));

    //run server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

//Test function 
#[tokio::test]
async fn test_insert_data() {
    let app = Router::new()
        .route("/insertData", post(features::insert_data));
    
    let server = TestServer::new(app).unwrap();
    let res1 = server.post("/insertData").json(&json!({
        "pk": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "content": "je test"
    })).await;
    res1.assert_status_success();
}

//Test function 
#[tokio::test]
async fn test_retrieve_data() {
    let app = Router::new()
        .route("/retrieveData", post(features::retrieve));
    let server = TestServer::new(app).unwrap();
    let res1 = server.post("/retrieveData").json(&json!({
        "addr": "81a54669727374939400dc002062ccd063cce6ccc8cc93cca5cc99cce70f45ccbdccfcccd82ccc8061ccc506506a2b7bcca63248cc96ccae3773cce1cce0dc00205c162b15cca8ccd67d314bcca81151207554ccd06c5b29597acc8471ccdcccc9ccc56614ccd902ccc642029401dc0020cc8f587c7757ccee36ccdbccfacce7ccebcceb5c10cc923c7c337164ccebcccccc96ccd85acc91ccdbcce839cca72d78dc002075ccebccc5ccd7ccf53d376eccd7ccffcc9d0e7eccadccabccb41fcca9ccc9cc89ccffccce3accda45cca5ccbfccffccb5cc94ccebcce7029402dc0020cca9ccf004ccb25fccb960ccecccd30e6bccedcca4cca3ccec7fcc9026ccda557933cce643cc8b39ccc0ccf0cc876d7519dc0020cc8710ccb64accfa3eccdecca365ccfc7e43cca517cca61045ccedcc92455acc93cc99ccdf31cc89cce40a35ccc125ccbe03"
    })).await;
    res1.assert_status(StatusCode::FOUND);
}

//Test function 
#[tokio::test]
async fn test_insert_file() {
    let app = Router::new()
        .route("/insertFile", post(features::insert_file));
    
    let server = TestServer::new(app).unwrap();
    let res1 = server.post("/insertFile").json(&json!({
        "pk": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "path": "./files/test.txt"
    })).await;
    //println!("{:?}", res1);
    res1.assert_status_success();
}

//Test function 
#[tokio::test]
async fn test_retrieve_file() {
    let app = Router::new()
        .route("/retrieveFile", post(features::retrieve_file));
    let server = TestServer::new(app).unwrap();
    let res1 = server.post("/retrieveFile").json(&json!({
        "addr": "81a54669727374939400dc0020cce67a6d7b39cc88cce97f05ccb21c37ccd1166837ccf3cce2cc824b701c5745ccd9ccccccf8cc8e04cca331ccc3dc0020ccdd54cc96ccbcccfb387c6c08200e0f05ccfd67ccbd5b1f5d7171ccc93a66cce275ccfb34cccbcc87cceb4c069401dc002013176d00ccebccc5ccd3ccfe4acc94ccd1cca1717e56430433ccad10cca2ccabccdfccfb2212cca9cc8508086807dc0020ccbbcc93cccd5d57ccb5cca5ccf4cc9334ccbbcceecc815379cc8514cca47534ccc4ccb7cc88cca9ccf3cc93cc9e7e52cc85cc9fccbb069402dc0020ccbaccbbcc9d67ccfc04ccb256cc81ccf162ccedccb908793fcca850ccaecc9fcca6cc8c5516ccc1ccdfccb62a392a27ccc6dc0020ccde2ccce1ccb01bccefccb5307accd4ccd554ccf7ccbd521cccc4cccb2854022bcccacce559ccb2ccc843ccbcccf806ccc808",
        "dest": "./files/results/test.txt" 
    })).await;
    res1.assert_status(StatusCode::FOUND);
}
