# Glossix 0.2.43

Dictionary files load only when opened or needed for saved practice, rather than blocking app startup. Removed redundant English translation cloning and account preference requests. Recent read responses are cached briefly per account with concurrent request deduplication; writes and manual refresh invalidate the cache. Added startup and dictionary/online-section loading states. Existing learning data and account rewards are unchanged. No additional SQL required.
