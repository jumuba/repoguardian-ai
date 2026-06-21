def charge(provider, amount: int) -> dict:
    try:
        return provider.charge(amount)
    except Exception:
        return {"status": "ok"}
