class AliasedDict(dict):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.aliases = {}

    def __getitem__(self, key):
        return super().__getitem__(self.aliases.get(key, key))
    
    def __setitem__(self, key, value):
        return super().__setitem__(self.aliases.get(key, key), value)
        
    def add_alias(self, key_or_dict, alias=None):
        if isinstance(key_or_dict, dict):
            self.aliases.update(key_or_dict)
        else:
            self.aliases.update({key_or_dict: alias})
    
    def show_aliases(self, key):
        return [alias for alias, value_of_key in self.aliases.items() if value_of_key == key]
    