use parking_lot::{Mutex, MutexGuard};
use rusqlite::{Connection, Params};
use tauri::Manager;

pub mod error;
pub use error::DbResult;

pub struct Db(Mutex<Connection>);

impl Db {
    pub fn init(app: &tauri::AppHandle) -> DbResult<Self> {
        let db_dir = app.path().app_data_dir()?;
        std::fs::create_dir_all(&db_dir)?;
        let conn = Connection::open(db_dir.join("omniwarp.db"))?;
        conn.execute_batch(include_str!("../../migrations/0001_create_search_providers.sql"))?;
        Ok(Self(Mutex::new(conn)))
    }

    #[inline]
    pub fn conn(&self) -> MutexGuard<'_, Connection> {
        self.0.lock()
    }

    #[inline]
    pub fn execute<P: Params>(&self, query: &str, params: P) -> DbResult<usize> {
        Ok(self.conn().execute(query, params)?)
    }
}
