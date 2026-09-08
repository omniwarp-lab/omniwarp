#[macro_export]
macro_rules! impl_error_serialize {
    ($($type:ty),+ $(,)?) => {
        $(
            impl ::serde::Serialize for $type {
                fn serialize<S>(&self, serializer: S) -> ::std::result::Result<S::Ok, S::Error>
                where
                    S: ::serde::Serializer,
                {
                    serializer.serialize_str(self.into())
                }
            }
        )+
    };
}
