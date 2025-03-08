use autonomi::{Client, Network, Wallet, Bytes};
use autonomi::client::{payment::PaymentOption, data_types::chunk::*};
use std::path::PathBuf;
use axum::{http::StatusCode, Json, response::IntoResponse};
use serde_json::{Value, json};
use serde::Deserialize;

//Message Deserialized
#[derive(Deserialize)]
pub struct CreateMessage{
    pub pk: String,
    pub content: String
}

//Retrieve Message  Deserialized
#[derive(Deserialize)]
pub struct RetrieveMessage{
   pub  addr: String,
}

//File uploaded
#[derive(Deserialize)]
pub struct UploadFile{
   pub  pk: String,
   pub  path: String
}

//File download
#[derive(Deserialize)]
pub struct DestFile{
   pub  addr: String,
   pub  dest: String
}

async fn connect_to_wallet(pk:&str) -> Result<Wallet, String>{
    let network = Network::new(true).expect("Failed to create network");
    let wallet = Wallet::new_from_private_key(network, pk).expect("Failed to connect wallet");
    Ok(wallet)
}

async fn connect_to_client() -> Result<Client, String>{
    let client = Client::init_local().await.expect("Failed to connect to network");
    Ok(client)
}

pub async fn insert_data(Json(payload): Json<CreateMessage>) -> impl IntoResponse{
    let wallet = connect_to_wallet(&payload.pk).await.unwrap();
    let client = connect_to_client().await.unwrap();
    let payment_option = PaymentOption::Wallet(wallet);
    let data = Bytes::from(payload.content);
    let (price, addr) = client.data_put(data, payment_option).await.expect("Failed to upload data");
    println!("Data uploaded for {price} in testnet ANT");
    (StatusCode::CREATED, Json(json!({"address": addr.to_hex()})))
}

pub async fn retrieve(Json(payload): Json<RetrieveMessage>) -> impl IntoResponse{
    let addr = payload.addr.trim_matches('"');
    let addr_map = DataMapChunk::from_hex(addr).unwrap();
    let client = connect_to_client().await.unwrap();
    let retrieved_data = client.data_get(&addr_map).await.expect("Failed to retrieve data");
    let message = String::from_utf8(retrieved_data.to_vec()).unwrap();
    (StatusCode::OK, Json(json!({"message": message})))
}

pub async fn insert_file(Json(payload): Json<UploadFile>) -> (StatusCode, Json<Value>){
    let path = PathBuf::from(payload.path);
    let wallet = connect_to_wallet(&payload.pk).await.unwrap();
    let client = connect_to_client().await.unwrap();
    let (price, addr) = client.file_upload(path, &wallet).await.expect("Failed to upload data");
    println!("File uploaded for {price} in testnet ANT");
    (StatusCode::OK, Json(json!({"address":addr.to_hex()})))
}

pub async fn retrieve_file(Json(payload): Json<DestFile>) -> StatusCode{
    let addr = payload.addr.trim_matches('"');
    let addr_map = DataMapChunk::from_hex(addr).unwrap();
    let client = connect_to_client().await.unwrap();
    let to_dest = PathBuf::from(payload.dest);
    client.file_download(&addr_map, to_dest).await.expect("Failed to retrieve data");
    StatusCode::OK
}
