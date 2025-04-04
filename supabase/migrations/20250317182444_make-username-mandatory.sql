UPDATE shopping_list SET user_name = 'Nobody' WHERE user_name IS NULL;
ALTER TABLE shopping_list
ALTER COLUMN user_name SET NOT NULL;
