class AliasedDict(dict):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.aliases = {}

    def __getitem__(self, key):
        item = self.aliases.get(key, key)
        # print(item)
        # return [super(AliasedDict, self).__getitem__(itemkey) for itemkey in itemlist]
        try:
            # itemkey ,= itemlist
            return super().__getitem__(item)
        except:
            return [super(AliasedDict, self).__getitem__(itemkey) for itemkey in item]

        # try:
        #     return super().__getitem__(self.aliases.get(key, key))
        # except(TypeError):
        #     itemlist = self.aliases.get(key, key)
        #     return [super().__getitem__(self.aliases.get(key, key)) for key in itemlist]

        # print(item)
        # if isinstance(itemlist, list):
        #     return [super().__getitem__(self.aliases.get(key, key)) for key in itemlist]
        # return super().__getitem__(self.aliases.get(key, key))
    
    def __setitem__(self, key, value):
        return super().__setitem__(self.aliases.get(key, key), value)
        
    def add_alias(self, alias, key):
        # key: list(alias)
        # if alias in self.aliases:
        #     self.aliases[alias].append(key_or_dict)
        # else:
        #     self.aliases[alias] = [key_or_dict]
        # first, simplest - alias: key
        # alias: list(key)
        if alias in self.aliases:
            # print(key_or_dict)
            self.aliases[alias].append(key)
        else:
            self.aliases[alias] = [key]
    
    def show_aliases(self, key):
        return [alias for alias, value_of_key in self.aliases.items() if value_of_key == key]


